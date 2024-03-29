import axios from "axios";
import { ColorResolvable, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";
import { capitalize } from "../types/misc";

class AnimalCommand extends Command {
    constructor() {
        super({
            aliases: ["animal"],
            description: "Get a random image of an animal",
            args: [new CommandArg({ name: "dataset", required: true, type: "choice", description:"Animals dataset to use", choices: [["bird", "bird"], ["cat", "cat"], ["dog", "dog"], ["duck", "duck"], ["fox", "fox"], ["panda", "panda"], ["racoon", "racoon"], ["red_panda", "red_panda"], ["kangaroo", "kangaroo"], ["koala", "koala"]] })]
        })
    }

    async run(call: CommandCall) {
        let datasets = {
            "bird": new Dataset("https://some-random-api.ml/animal/bird", {image_path_field: "image"}),
            "cat": new Dataset("https://aws.random.cat/meow", {powered_by: "random.cat", image_path_field: "file"}),
            "dog": new Dataset("https://random.dog/woof.json"),
            "duck": new Dataset("https://random-d.uk/api/v2/random"),
            "fox": new Dataset("https://randomfox.ca/floof/", {image_path_field: "image"}),
            "panda": new Dataset("https://some-random-api.ml/animal/panda", {image_path_field: "image"}),
            "racoon": new Dataset("https://some-random-api.ml/animal/raccoon", {image_path_field: "image"}),
            "red_panda": new Dataset("https://some-random-api.ml/animal/red_panda", {image_path_field: "image"}),
            "kangaroo": new Dataset("https://some-random-api.ml/animal/kangaroo", {image_path_field: "image"}),
            "koala": new Dataset("https://some-random-api.ml/animal/koala", {image_path_field: "image"}),
        };

        let dataset : Dataset = datasets[call.args.dataset as keyof typeof datasets];

        let embed = new MessageEmbed()
            .setTitle(capitalize(dataset.title ? dataset.title : call.args.dataset))
            .setImage(await dataset.getImage())
            .setFooter(`Powered by ${dataset.powered}`)
            .setColor(dataset.color ? dataset.color : "#0099ff")

        call.reply({embeds:[embed]})
    }

}

class Dataset {
    constructor(url: string, options?: {powered_by?: string, image_path_field?: string, title?: string, color?: ColorResolvable}) {
        this.url = url;
        if(options){
            this.powered_by = options.powered_by;
            this.image_path_field = options.image_path_field;
            this.title = options.title;
            this.color = options.color;
        }
    }

    public title?: string;
    public url: string;
    public powered_by?: string;
    public image_path_field?: string;
    public color?: ColorResolvable;

    get powered() {
        if(this.powered_by) return this.powered_by;
        return new URL(this.url).hostname;
    }

    get image_field() {
        if(this.image_path_field) return this.image_path_field;
        return "url";
    }

    public async getImage(): Promise<string> {
        let r = await axios.get(this.url);
        return r.data[this.image_field];
    }
}

export default AnimalCommand;