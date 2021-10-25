import { Client, ClientOptions } from 'discord.js';
// import type Pino from 'pino';
import logger from 'pino';
import Pino from 'pino';
import CommandHandler from '../CommandHandler';

class BotClient extends Client {
    public commandHandler: CommandHandler;
    public logger: Pino.Logger;

    constructor(options: ClientOptions){
        super(options);

        this.commandHandler = new CommandHandler(this);
        this.commandHandler.loadCommands();

        // Logger
        let pinoOptions: Pino.LoggerOptions = {level: process.env.LOG_LEVEL || 'info'};
        if(process.env.PRETTY_PRINT == "true"){
            pinoOptions.transport = {target: 'pino-pretty'}
        }
        this.logger = logger(pinoOptions);
    }
}

export default BotClient;