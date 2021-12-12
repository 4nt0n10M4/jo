import axios from "axios";
import {  MessageEmbed } from "discord.js";
import Command from "../types/Command";
import CommandCall from "../types/CommandCall";

class apodCommmand extends Command {
    constructor(){
        super({
            aliases: ["apod"],
            description: "Get the Astronomy Picture of the Day",

        })
    }

    async run(call: CommandCall) {
        const key = process.env.NASA_API_KEY ? process.env.NASA_API_KEY : "DEMO_KEY";
        const {data} = await axios.get("https://api.nasa.gov/planetary/apod?api_key=" + key);

        const embed = new MessageEmbed()
        .setAuthor("Astronomy Picture of the Day")
        .setColor("#0099ff")
        .setTitle(data.title)
        .setImage(data.url)
        .setFooter(data.date+" | "+data.copyright)

        call.reply({embeds: [embed]});
        
    }
}

export default apodCommmand