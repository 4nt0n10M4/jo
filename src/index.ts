import BotClient from './types/Client';
import { Intents } from 'discord.js';
import * as dotenv from "dotenv";
const inspector = require('inspector');
dotenv.config();

const client = new BotClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], allowedMentions: { repliedUser: false } });

client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}!`);
    client.logger.info('Logger started!');
});

client.on('messageCreate', (msg) => {
    inspector.console.log(msg);
    try{
        client.commandHandler.handleMessage(msg);
    } catch(e){
        client.logger.error({file: 'index', fnc: 'on:messageCreate', msg}, 'Error sending message to commandHandler', e);
    }
});

client.on('interactionCreate', (interaction) => {
    if(!interaction.isCommand())return;
    inspector.console.log(interaction);
    try{
        client.commandHandler.handleSlashCommand(interaction);
    } catch(e){
        client.logger.error({file: 'index', fnc: 'on:interactionCreate', interaction}, "Error sending interaction to commandHandler", e);
    }
})

client.login(process.env.DISCORD_TOKEN);