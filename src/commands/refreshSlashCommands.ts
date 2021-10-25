import Command from '../types/Command';
import CommandCall from "../types/CommandCall";

class RefreshSlashCommandsCommand extends Command {
    constructor(){
        super({
            aliases: ['refreshSlashCommands', 'rsc'],
            ownerOnly: true,
            noPermsSilent: true,
            hidden: true
        });
    }

    async run(call: CommandCall){
        try {
            let r = await call.client.commandHandler.refreshSlashCommands();
            if(r !== true)throw new Error(`${r}`);
            
            return call.reply({ content: 'doneso' });
        } catch(e){
            return call.reply({ content: `Whoops!\n\`\`\`js\n${e}\n\`\`\`` });
        }
    }
};

export default RefreshSlashCommandsCommand;