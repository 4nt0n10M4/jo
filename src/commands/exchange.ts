import axios from "axios";
import { MessageEmbed } from "discord.js";
import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";
import { Currencies, Currency } from "../types/misc";

class ExchangeCommand extends Command {
    constructor() {
        super({
            aliases: ["exchange"],
            description: "Exchange a currency",
            args: [new CommandArg({ name: "amount", required: true, description: "Amount to exchange", type: "string"}), new CommandArg({name:"from", required: true, description: "Currency to exchange from", type: "string"}), new CommandArg({name:"to", required: true, description: "Currency to exchange to", type: "string"})]
        })
    }
    async run(call: CommandCall) {
        let amount = parseFloat(call.args.amount);
        let from: Currency = call.args.from.toLowerCase();
        let to: Currency = call.args.to.toLowerCase();

        if (isNaN(amount)) return call.reply({content:"Invalid amount", ephemeral:true});
        if (!Object.keys(Currencies).includes(from) ) return call.reply({content:"Invalid currency", ephemeral:true});
        if(!Object.keys(Currencies).includes(from)) return call.reply({content:"Invalid currency", ephemeral:true});

        let exchangeData = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from}/${to}.json`);
        let toValue = exchangeData.data[to];
        let result = amount * toValue;

        const embed = new MessageEmbed()
        .setColor(0x00AE86)
        .setTitle(`${Currencies[from]} to ${Currencies[to]}`)
        .setDescription(`${amount} ${from} is ${result} ${to}`)
        .addField(Currencies[to]+" value", `${toValue}`)
        .setFooter("Powered by github.com/fawazahmed0/currency-api");
    }
    
}

export default ExchangeCommand;