import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class EvalCommand extends Command {
    constructor(){
        super({
            aliases: ['eval'],
            ownerOnly: true,
            noPermsSilent: true,
            hidden: true,
            args: [new CommandArg({name: 'code', description: 'The code to eval', required: true, type: 'content'})]
        });
    }

    run(call: CommandCall){
        let response;
        try{
            response = eval(call.args.code);
        } catch(e){
            response = e;
        }
        if(typeof response !== 'string')response = JSON.stringify(response, null, 2);

        response = response.replace(process.env.DISCORD_TOKEN+"", '');

        return call.reply({ content: `\`\`\`js\n${response.replace('\`', '\\\`')}\n\`\`\`` });
    }
};

export default EvalCommand;