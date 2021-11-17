import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";
import axios from "axios";
import { AxiosRequestConfig } from "axios";
class CodeCommand extends Command {
  constructor() {
    super({
      aliases: ["code"],
      description: "Make codex code something",
      args: [
        new CommandArg({
          name: "intructions",
          description: "Instructions to code",
          required: true,
          type: "content",
        }),
      ],
    });
  }

  async run(call: CommandCall) {
    const instructions = call.args["intructions"];

    if (!process.env.CODEX_TOKEN)
      return call.reply({ content: "No codex token found" });
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CODEX_TOKEN,
    };

    const data = {
      prompt: `\"\"\"\n${instructions}\"\"\"`,
      temperature: 0,
      max_tokens: 64,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
    const options: AxiosRequestConfig = {
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
