import Command from '../types/Command';
import CommandCall from "../types/CommandCall";

class PingCommand extends Command {
    constructor(){
        super({
            aliases: ['ping'],
            description: 'The bot sends "pong" in response'
        });
    }

    run(call: CommandCall){
        return call.reply({ content: 'pong' });
    }
};

export default PingCommand;