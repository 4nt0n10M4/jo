import { Client, ClientOptions } from 'discord.js';
// import type Pino from 'pino';
import logger from 'pino';
import Pino from 'pino';
import CommandHandler from '../CommandHandler';
import { PrismaClient } from '@prisma/client'

class BotClient extends Client {
    public commandHandler: CommandHandler;
    public logger: Pino.Logger;
    public database: PrismaClient;

    constructor(options: ClientOptions){
        super(options);

        this.commandHandler = new CommandHandler(this);
        this.commandHandler.loadCommands();
        this.database = new PrismaClient();

        // Logger
        let pinoOptions: Pino.LoggerOptions = {level: process.env.LOG_LEVEL || 'info'};
        if(process.env.PRETTY_PRINT == "true"){
            pinoOptions.transport = {target: 'pino-pretty'}
        }
        this.logger = logger(pinoOptions);
    }
}

export default BotClient;
