import axios from "axios"
import { MessageEmbed } from "discord.js"
import Command from "../types/Command"
import CommandCall from "../types/CommandCall"

class catCommand extends Command {
    constructor() {
        super({
            description: "Return a random image of a cat.",
            aliases: ["cat"],
        })
    }
        async run (call: CommandCall) {
            const img = await axios.get("https://thatcopy.pw/catapi/rest/")

            const embed = new MessageEmbed()
            .setTitle("Cat")
            .setImage(img.data.url)
            .setColor("#7289DA")
            .setThumbnail("Powered by thatcopy.pw/catapi")

            call.reply({embeds:[embed]})
        }
} 

export default catCommand