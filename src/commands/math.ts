import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from '../types/CommandCall';

class MathCommand extends Command {
    constructor(){
        super({
            aliases: ['math'],
            description: 'Calculates math expressions',
            args: [new CommandArg({name: 'expression', required: true, description: 'The expression to calculate', type: 'string'})]
        })
    }
    async run(call: CommandCall){
        const { expression } = call.args;
        const url = 'https://api.mathjs.org/v4/';
        const { data } = await axios.post(url, { expr: expression, headers: { 'Content-Type': 'application/json' } });

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Math')
            .addField('Expression', `${expression}`)
            .addField('Result', `\`\`\`js\n${data.result}\`\`\``)
            .setFooter('Powered by api.mathjs.org');

        return call.reply({ embeds:[embed] });
    }
}