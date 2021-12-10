import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import CommandCall from "../types/CommandCall";

class duckCommand extends Command {
    constructor() {
        super({
            aliases: ["duck"],
            description: "Return a random duck image",
        });
    }
    async run(call: CommandCall) {
        const {url} = (await axios.get("https://random-d.uk/api/v2/random")).data;

        const embed = new MessageEmbed()
        .setTitle("Duck")
        .setImage(url)
        .setColor(0x00ff00)
        .setFooter("Powered by random-d.uk");

        call.reply({embeds: [embed]});
    }
}

export default duckCommand