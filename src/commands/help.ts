import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";
import { MessageEmbed } from "discord.js"

class HelpCommand extends Command {
    constructor(){
        super({
            aliases: ['help'],
            description: 'Get a list of commands or info on how to use them',
            args: [new CommandArg({name: 'command', description: 'A command to see more info', required: false, type: "string"})]
        });
    }

    run(call: CommandCall){
        let cmds = call.client.commandHandler.commands.filter(cmd => !cmd.hidden);

        let responseEmbed = new MessageEmbed()
            .setAuthor({name: call.client.user!.username, iconURL: call.client.user?.displayAvatarURL()});

        if(call.args.command){
            let cmdName : string = call.args.command;
            let prefix = call.client.commandHandler.prefix;
            if(call.args.command.startsWith(prefix))cmdName = cmdName.substring(prefix.length);

            let cmd = cmds.get(cmdName)
            if(cmd){
                responseEmbed.setTitle(cmd.name)
                    .setDescription(cmd.args.length > 0 ? `${cmd.description}\n\`\`\`\n${cmd.usage}\n\`\`\` \`\`\`\n${cmd.argsExplanation}\n\n\`\`\` ` : (cmd.description ? cmd.description : '*No description provided*'))
                return call.reply({ embeds: [responseEmbed] });
            }
            responseEmbed.setTitle(`❌ Command not found`);
            return call.reply({ embeds: [responseEmbed], ephemeral: true });
        }

        responseEmbed.setDescription(`**Commands:**\n${cmds.map(cmd => `**${cmd.name}**${cmd.description ? ` - ${cmd.description}` : ''}\n\`\`\`\n${cmd.usage}\n\`\`\``).join('\n')}`);
        call.reply({embeds: [responseEmbed]});
    }
};

export default HelpCommand;
