import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class EchoCommand extends Command {
    constructor(){
        super({
            aliases: ['help'],
            description: 'Get a list of commands or info on how to use them',
            args: [new CommandArg({name: 'command', description: 'A command to see more info', required: false, type: "string"})]
        });
    }

    run(call: CommandCall){
        let cmds = call.client.commandHandler.commands.filter(cmd => !cmd.hidden);
        if(call.args.command){
            let cmdName : string = call.args.command;
            let prefix = call.client.commandHandler.prefix;
            if(call.args.command.startsWith(prefix))cmdName = cmdName.substring(prefix.length);

            let cmd = cmds.get(cmdName)
            if(cmd)return call.reply({ content: `\`\`\`\n${cmd.usage}\n\`\`\`${cmd.args.length>0 ? `\`\`\`\n${cmd.argsExplanation}\n\n\`\`\`` : cmd.description}` })
            return call.reply({ content: '❌ Command not found', ephemeral: true });
        }
        
        return call.reply({ content: `__**Commands:**__\n${cmds.map(cmd => `**${cmd.name}** ${cmd.description}\n\`\`\`\n${cmd.usage}\n\`\`\``).join('\n')}`, allowedMentions: {parse: []} });
    }
};

export default EchoCommand;