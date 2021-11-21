import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";
import axios, { AxiosRequestConfig } from "axios";

class CodeCommand extends Command {
	constructor() {
		super({
			aliases: ["code", "codex"],
			description: "Make codex code something",
			args: [new CommandArg({ name: "instructions", description: "Instructions to code", required: true, type: "content", })]
		});
	}

	async run(call: CommandCall) {
		if (!process.env.CODEX_TOKEN) return call.reply({ content: "**Error**: Codex token not found" });

		let headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer  ${process.env.CODEX_TOKEN}`,
		};

		let data = {
			prompt: `# Python 3.7\n \n\"\"\"\n${call.args.instructions}\n# An python function for the above instructions\n\"\"\"\n`,
			temperature: 0,
			max_tokens: 640,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
			stop: ["#", "\"\"\""]
		};
		
		let options: AxiosRequestConfig = {
			url: "https://api.openai.com/v1/engines/davinci-codex/completions",
			method: "POST",
			headers: headers,
			data: JSON.stringify(data),
		};

		let res, json: any;
		res = await axios(options);
		json = await res.data;

		return call.reply({ content: "```py\n" + json.choices[0].text + "\n```" });
	}
}

export default CodeCommand;
