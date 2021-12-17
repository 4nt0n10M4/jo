import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";
import isPromise from 'is-promise';

class EvalCommand extends Command {
	constructor(){
		super({
			aliases: ['eval'],
			ownerOnly: true,
			noPermsSilent: true,
			hidden: true,
			args: [ new CommandArg({name: 'code', description: 'The code to eval', required: true, type: 'content'}) ]
		});
	}

	async run(call: CommandCall){
		let response;
		let code = call.args.code;

		if(code.startsWith('```') && code.endsWith('```')) {
			code = code.trim().replace(/(^.*?\s)|(\n.*$)/g, '');
		}

		try {
			response = eval(code);
			if(Array.isArray(response)) { // Resolve any promises on arrays
				let i = 0;
				let responsearr = [];
				for await (let r of response){
					responsearr[i] = r; i++;
				}
				response = responsearr;
			}

			response = isPromise(response) ? await response : response;
		} catch(err) {
			return call.reply({ content: `Error while executing: \`${err}\`` });
		}

		if(typeof response !== 'string') response = JSON.stringify(response, null, 2);

		response = response.replace(process.env.DISCORD_TOKEN+"", '');

		return call.reply({ content: `\`\`\`js\n${response.replace('\`', '\\\`')}\n\`\`\`` });
	}
};

export default EvalCommand;