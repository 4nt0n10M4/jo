import axios from "axios";
import { MessageEmbed } from "discord.js";
import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";

class AnimalCommand extends Command {
    constructor() {
        super({
            aliases: ["animal"],
            description: "Get a random image of an animal",
            args: [new CommandArg({ name: "dataset", required: true, type: "choice", description:"Animals dataset to use", choices: [["cat","Cat"], ["duck", "Duck"]] })]
        })
    }

    async run(call: CommandCall) {
        const { dataset } = call.args;
        let img, source

        switch (dataset) {
            case "Cat":
                img = (await (await axios.get("https://thatcopy.pw/catapi/rest/")).data.url)
                source = "thatcopy.pw/catapi/"
                
                break;
            case "Duck":
                img = (await (await axios.get("https://random-d.uk/api/v2/random")).data.url)
                source = "random-d.uk"

                break;
        
            default:
                img = "https://http.cat/404.jpg"
                source = "https://http.cat/"
                break;
        }

        const embed = new MessageEmbed()
        .setTitle(`${dataset}`)
        .setImage(img)
        .setFooter(`Powered by ${source}`)
        .setColor("#0099ff")

        call.reply({embeds:[embed]})
    }

}

export default AnimalCommand;