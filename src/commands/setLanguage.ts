import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";

class SetLanguageCommand extends Command {
    constructor(){
        super({
            aliases: ['setlanguage'],
            description: 'Set the language of the bot.',
            permissions: ['MANAGE_GUILD'],
            args: [new CommandArg({ name: 'language', description:"Language to set", type: 'choice', choices: [["en","en-US"],["es","es-ES"],["fr","fr"]], required: true })]
        })
    }
    async run(call: CommandCall){
        const language: string = call.args.language
        const guild = await call.client.database.guild.findFirst({where: {id: call.member.guild.id}});

        if(!guild){
            await call.client.database.guild.create({data:{id: call.member.guild.id, locale: language}});
        }else{
            await call.client.database.guild.update({where: {id: call.member.guild.id}, data: {locale: language}});
        }

        call.reply({content: `✅Language set to ${language}`});
    }
}

export default SetLanguageCommand;