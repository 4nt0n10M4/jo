import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";
import {MessageEmbed, MessageButton, MessageActionRow, Message, User } from "discord.js"
class EchoCommand extends Command {
    constructor(){
        super({
            aliases: ['help'],
            description: 'Get a list of commands or info on how to use them',
            args: [new CommandArg({name: 'command', description: 'A command to see more info', required: false, type: "string"})]
        });
    }

    async run(call: CommandCall){
        let cmds = call.client.commandHandler.commands.filter(cmd => !cmd.hidden);
        const row = new MessageActionRow()
        .addComponents(
         new MessageButton()
           .setCustomId('Direct Message')
           .setLabel('MD')
           .setStyle('PRIMARY'),
       
         new MessageButton()
         .setCustomId('GUILD')
         .setLabel('This channel')
         .setStyle("PRIMARY")
       
       );
        if(call.args.command){
            let cmdName : string = call.args.command;
            let prefix = call.client.commandHandler.prefix;
            if(call.args.command.startsWith(prefix))cmdName = cmdName.substring(prefix.length);

            let cmd = cmds.get(cmdName)
            if(cmd)return call.reply({ content: `\`\`\`\n${cmd.usage}\n\`\`\`${cmd.args.length>0 ? `\`\`\`\n${cmd.argsExplanation}\n\n\`\`\`` : cmd.description}` })
            return call.reply({ content: '❌ Command not found', ephemeral: true });
        }
        const myName = !!call.client.user?.username ? call.client.user.username : "Jo!"  
        const helpEmbed = new MessageEmbed()
        .setAuthor(myName, call.client.user?.displayAvatarURL()) 
        .setDescription(`__**Commands:**__\n${cmds.map(cmd => `**${cmd.name}** - ${cmd.description}\n\`\`\`\n${cmd.usage}\n\`\`\``).join('\n')}`)
        .setFooter(`Requested by: ${call.member.user.tag}.`)
        const r = call.reply({ content: `Where do you want me to send the command list?`, allowedMentions: {parse: []}, components: [row] });

        let msg = await r[0]
        if(!(msg instanceof Message))return;
        
        const collector = msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 })

        collector.on("collect", i =>{
            if (i.customId === "MD") {
                
                 i.reply({content:"✅", ephemeral: true})
                 if(!(i.member?.user instanceof User))return;
                 if(!(i.message instanceof Message))return;
                 i.member?.user.send({embeds:[helpEmbed]})
                 i.message.delete()

                } else {
                 if(!(i.message instanceof Message))return;
                    i.reply({embeds: [helpEmbed]})
                    i.message.delete()
                }

        
        })
        collector.on("end", _ => {
            if(!(msg instanceof Message))return;
            msg.delete()
        })
    }
};

export default EchoCommand;