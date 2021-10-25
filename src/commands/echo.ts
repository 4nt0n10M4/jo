import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class EchoCommand extends Command {
    constructor(){
        super({
            aliases: ['echo'],
            description: 'Make the bot say anything you want',
            args: [new CommandArg({name: 'text', description: 'The text to say', required: true, type: "content"})]
        });
    }

    run(call: CommandCall){
        return call.reply({ content: call.args.text, allowedMentions: {parse: []} });
    }
};

export default EchoCommand;