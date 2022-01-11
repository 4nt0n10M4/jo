import Collection from "@discordjs/collection";
import BotClient from "./types/Client";
import Command from "./types/Command";
import { promises as fs } from 'fs';
import path from 'path';
import { CommandInteraction, GuildMember, Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import CommandCall from "./types/CommandCall";
import Parser, { createParser } from 'discord-cmd-parser';
import { Args, capitalize, ChannelTypeForSlashCommandArgumentToChannelName, CommandNotFoundError, InvalidChannelTypeError, InvalidChoiceError } from "./types/misc";
import MentionsParser from "./types/MentionsParser";
import parse from "parse-duration";

class CommandHandler {
    constructor(client: BotClient){
        this.client = client;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.prefix = process.env.PREFIX || 'jo!';

        this.argsParser = createParser();
        this.mentionsParser = new MentionsParser(this.client);
    }
    
    public commands: Collection<String, Command>
    public aliases: Collection<String, String>
    public client: BotClient;
    public prefix: string;
    public argsParser: Parser.Parser;
    public mentionsParser: MentionsParser;

    getCmd(name: string){
        let cmd = this.commands.get(name);
        if(!cmd){
            let theCommandIsAnAliase = this.aliases.get(name);
            if(theCommandIsAnAliase) cmd = this.commands.get(theCommandIsAnAliase);
        }
        if(!cmd)throw new CommandNotFoundError("Command not found");

        return cmd;
    }

    async handleMessage(msg: Message){
        if(msg.author.bot)return;
        if(!msg.content.startsWith(this.prefix))return;
        if(msg.guild == null)return; // Igmore DMs
        if(msg.member == null)return; //ts stop crying

        let content = msg.content.substring(this.prefix.length).trim();
        let args = content.split(' '); args.shift(); // remove prefix and command name
        let argsStr = args.join(' ');
        let current_arg; // used to know what argument throwed the exception
        try {
            let cmd = this.getCmd(content.split(' ')[0]);
            
            let parsedArgs : Args = this.argsParser.parseCommandArgs(this.argsParser.parse(argsStr), cmd.argsForParser()); // parse general args
            Object.keys(parsedArgs).forEach(k => { if(parsedArgs[k] == '')delete parsedArgs[k] }) // remove empty args
            // handle args
            for await (let a of cmd.args){
                current_arg = a.name;
                if(parsedArgs[a.name] == undefined)continue;
                try {
                    if(a.type == 'content'){ // handle "content" args
                        parsedArgs[a.name] = argsStr;
                    } else if(a.type == 'user'){
                        parsedArgs[a.name] = await this.mentionsParser.userByMentionOrId(parsedArgs[a.name]);
                    } else if(a.type == 'role'){
                        if(!msg.guild)throw new Error("This command can't be used on DMs");

                        parsedArgs[a.name] = await this.mentionsParser.roleByMentionOrId(parsedArgs[a.name], msg.guild);
                    } else if (a.type == 'choice'){
                        if(!a.choices)return;
                        if(!Array.prototype.concat(...a.choices).includes(parsedArgs[a.name])) throw new InvalidChoiceError("The argument you provided is not a choice.", a.choices);
                        a.choices.forEach(x =>{
                            if (x[0] === parsedArgs[a.name]) return parsedArgs[a.name] = x[1];
                        })
                    } else if (a.type == 'channel'){
                        if(!msg.guild)throw new Error("This command can't be used on DMs");

                        parsedArgs[a.name] = await this.mentionsParser.channelByMentionOrId(parsedArgs[a.name], msg.guild);
                        if(a.channelTypes){
                            let ct = a.channelTypes.map(t => ChannelTypeForSlashCommandArgumentToChannelName[t]);
                            if(!ct.includes(parsedArgs[a.name].type))throw new InvalidChannelTypeError(`Invalid channel, it must be ${a.channelTypes.map(t => ChannelTypeForSlashCommandArgumentToChannelName[t]).join(' or ')}. // You provided ${parsedArgs[a.name].type}`);
                        }
                    } else if (a.type == 'duration'){
                        parsedArgs[a.name] = parse(parsedArgs[a.name], a.durationUnits);
                    }
                } catch (e){
                    if(a.required)throw e; // If is required we throw the error but otherwise we just ignore the arg
                    delete parsedArgs[a.name];
                }
            }
            current_arg = undefined;

            let neededArgs = cmd.args.filter(a => a.required) // get required args
                .filter(a => parsedArgs[a.name] == undefined); // check if any of those is undefined
            // If any of the required args was not specified throw an Error
            if(neededArgs.length > 0)return await msg.reply({ content: `**Error**: Not enough arguments passed.\n\`\`\`${this.prefix}${cmd.usage}\`\`\`\`\`\`${cmd.argsExplanation}\`\`\`` }); // ${neededArgs.map(a => a.name).join('", "')}
            
            // All the args SeemsGood so we call the cmd
            await this.execCmd(new CommandCall({command: cmd, client: this.client, args: parsedArgs, member: msg.member, _type: 'Message', _source: msg}));
        } catch(e){
            if(e instanceof CommandNotFoundError)return this.client.logger.debug({file: 'CommandHandler', fnc: 'handleMessage'}, 'Handled error (cmd not found)', e);

            msg.reply({ content: `${current_arg ? `Error found while parsing \`${current_arg}\` arg.\n` : ''}\`\`\`js\n${e}\n\`\`\`` });
            if(e instanceof InvalidChannelTypeError || e instanceof InvalidChoiceError)return this.client.logger.debug({file: 'CommandHandler', fnc: 'handleMessage'}, `Handled error (${e.name})`, e);
            this.client.logger.error({file: 'CommandHandler', fnc: 'handleMessage', msg, user: {tag: msg.author.tag, id: msg.author.id}, guild: {id: msg.guild?.id, name: msg.guild?.name}}, 'Error handling message', e);
        }
    }

    async handleSlashCommand(interaction: CommandInteraction){
        if(!(interaction.member instanceof GuildMember)){
            if(interaction.member == null)throw new Error("[CommandHandler/handleSlashCommand] Member is null");
            let member = await interaction.guild?.members.fetch(interaction.member.user.id);
            if(member == undefined)throw new Error("[CommandHandler/handleSlashCommand] Couldn't fetch member");
            interaction.member = member;
        }
        try {
            let cmd = this.getCmd(interaction.commandName);
            let args: Args = {_orig: interaction};
            // handle args
            interaction.options.data.forEach(data => {
                if(data.type == 'STRING'){ // handle "content" args
                    let arg = cmd.argsByName[data.name];
                    if(arg.type == 'duration'){
                        args[data.name] = parse(`${data.value}`, arg.durationUnits);
                    } else {
                        args[data.name] = data.value;
                    }
                } else if(data.type == 'USER'){
                    return args[data.name] = interaction.options.get(data.name)?.user;
                } else if(data.type == 'ROLE'){
                    return args[data.name] = interaction.options.get(data.name)?.role;
                } else if(data.type == 'CHANNEL'){
                    return args[data.name] = interaction.options.get(data.name)?.channel;
                }
            });
            await this.execCmd(new CommandCall({command: cmd, client: this.client, args, member: interaction.member, _type: 'SlashCommand', _source: interaction}));
        } catch(e){
            this.client.logger.error({file: 'CommandHandler', fnc: 'handleSlashCommand', interaction, user: {tag: interaction.user.tag, id: interaction.user.id}, guild: {id: interaction.guild?.id, name: interaction.guild?.name}}, 'Error handling SlashCommand', e);
        }
    }

    async execCmd(call: CommandCall){
        let channel = call._source?.channel?.type !== 'DM' ? call._source.channel : undefined;
        let permsCheck = call.command.hasPermission(call.member, channel);
        if(!permsCheck.check){
            if(call.command.noPermsSilent)return;

            call.reply({ content: `**Error**: The \`${call.command.name}\` command requires one or more permissions you're lacking: \`${permsCheck.missing.map(p => capitalize(p.split('_').join(' ').toLowerCase())).join('`, `')}\`.` });
            return this.client.logger.info({file: 'CommandHandler', fn: 'execCmd', cmd: call.command.name, args: call.args, user: {id: call.member.id, tag: call.member.user.tag}, guild: {id: call._source.guild?.id, name: call._source.guild?.name}, permsCheck}, 'Denied execution of command, lacking permissions');
        }

        try{
            await call.command.run(call);
            this.client.logger.info({file: 'CommandHandler', fn: 'execCmd', cmd: call.command.name, args: call.args, user: {id: call.member.id, tag: call.member.user.tag}, guild: {id: call._source.guild?.id, name: call._source.guild?.name}}, 'Executed command');
        } catch (e){
            call.reply({ content: `\`\`\`js\n${e}\n\`\`\`` })
            this.client.logger.error({file: 'CommandHandler', fnc: 'execCmd', call}, 'Error executing command', e);
        }
    }

    async loadCommands(){
        let files = (await fs.readdir(path.join(__dirname, './commands'))).filter(file => file.endsWith('.js'));
        this.commands.clear();

        files.forEach(command => {
            let cmd = require(`./commands/${command}`).default;
            cmd = new cmd({commandHandler: this});
            cmd.aliases.forEach((name: string, i: number) => {
                if(i == 0){
                    this.commands.set(name, cmd);
                } else {
                    this.aliases.set(name, cmd.name);
                }
            });
        });
    }

    async refreshSlashCommands(){
        let commands = this.commands
            .filter(cmd => !cmd.hidden && !cmd.ownerOnly)
            .map(cmd => {
                let description = cmd.description ? cmd.description : `aka ${cmd.aliases.join(', ')}`;
                if(description.length > 100){
                    this.client.logger.warn({cmd: cmd.name, fn: 'refreshSlashCommands', file: 'CommandHandler', description}, `'${cmd.name}' description is too long (${description.length}>100)`);
                    description =  description.substring(0, 97)+'...';
                }

                let sc = new SlashCommandBuilder().setName(cmd.name)
                .setDescription(description);

                cmd.args.forEach(arg => {
                    if(arg.type == 'string' || arg.type == 'content' || arg.type == 'duration'){
                        return sc.addStringOption(option => option
                            .setName(arg.name)
                            .setDescription(arg.description)
                            .setRequired(arg.required)
                        );
                    } else if (arg.type == 'user') {
                        return sc.addUserOption(option => option
                            .setName(arg.name)
                            .setDescription(arg.description)
                            .setRequired(arg.required)
                        );
                    } else if (arg.type == 'role'){
                        return sc.addRoleOption
                        (option => option
                            .setName(arg.name)
                            .setDescription(arg.description)
                            .setRequired(arg.required)
                        );
                    } else if (arg.type == 'channel'){
                        return sc.addChannelOption
                        (option => {
                            option
                            .setName(arg.name)
                            .setDescription(arg.description)
                            .setRequired(arg.required)
                            if(arg.channelTypes)option.addChannelTypes(arg.channelTypes);
                            return option;
                        });
                    } else if (arg.type == 'choice'){
                        return sc.addStringOption
                        (option => {
                            option
                            .setName(arg.name)
                            .setDescription(arg.description)
                            .setRequired(arg.required)
                            if(arg.choices)option.addChoices(arg.choices);
                            return option
                        })
                    }
                });
                
                return sc.toJSON();
            });
            
        const rest = new REST({ version: '9' }).setToken(this.client.token+'');

        try{
            await rest.put(process.env.DISCORD_DEV_GUILD ? Routes.applicationGuildCommands(this.client.application!.id, process.env.DISCORD_DEV_GUILD) : Routes.applicationCommands(this.client.application!.id), { body: commands })
            this.client.logger.info('✅ Slash commands refreshed');
        } catch(e){
            this.client.logger.error('Error updating slash commands', e);
            return e;
        }

        return true;
    }
}

export default CommandHandler;