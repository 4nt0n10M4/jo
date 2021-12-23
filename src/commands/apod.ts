import axios from "axios";
import { MessageEmbed } from "discord.js";
import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";
import { formatDateMDY as formatDate } from "../types/misc";

class ApodCommmand extends Command {
    constructor(){
        super({
            aliases: ["apod"],
            description: "Get the Astronomy Picture of the Day",
            args: [ new CommandArg({ name:"date", required: false, description: "Date of the picture", type: "string" }) ]
        })
    }

    async run(call: CommandCall) {
        let dateString: string | undefined;

        if (call.args.date) {
            let date = new Date(call.args.date);
            if(isNaN(date.getTime())) throw new Error("Invalid date");
            dateString = formatDate(date);
        }

        let { data } = await axios.get(`https://api.nasa.gov/planetary/apod`, { 
            params: {
                api_key: process.env.NASA_API_KEY || "DEMO_KEY",
                date: dateString
            }
        });
        
        let embed = new MessageEmbed()
            .setAuthor("Astronomy Picture of the Day", undefined, 'https://apod.nasa.gov/apod')
            .setColor("#0099ff")
            .setTitle(data.title)
            .setImage(data.url)
            .setTimestamp(new Date(data.date));
        
        if(data.explanation) embed.setDescription(data.explanation);
        if(data.copyright) embed.setFooter(data.copyright);

        return call.reply({ embeds: [embed] });
    }
}

export default ApodCommmand;