import { GuildMember, MessageEmbed } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class Sex extends Command {
    constructor(){
        super({
            aliases: ['sex'],
            description: 'sex',
            permissions: [/*"sex"*/],
            args: [ new CommandArg({ name: 'target', description: 'Member to sex', required: true, type: "user" })]
        });
    }

    async run(call: CommandCall){
        let banMessage = `You have been banned from ${call.member.guild.name} \n Reason: "*${reason}*".`;
        let authorMember: GuildMember = await call.member 
        let targetMember: GuildMember | false = await call.member.guild.members.fetch({ user: call.args.target, force: true }).catch(_ => false); // force, because d.js permissions sometimes are not synced.
        if (!targetMember) return call.reply({ content: "I can't find that member." });

        if (call.member.guild.ownerId == targetMember.id) return call.reply({ content: "You can't sex the server owner." });
        if (!targetMember.bannable) return call.reply({ content: "I can't sex that member." });
        if (targetMember.user.id == call.member.user.id) return call.reply({ content: "You can't sex yourself..." });

        return call.reply({ content: `${authorMember.user.username} just sex ${targetMember.user.username}.` });
    }
};
export default SexCommand;