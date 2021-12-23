import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class BanCommand extends Command {
    constructor(){
        super({
            aliases: ['ban'],
            description: 'Ban a user in your guild',
            permissions: ["BAN_MEMBERS"],
            args: [ new CommandArg({ name: 'target', description: 'Member to ban', required: true, type: "user" }), new CommandArg({ name:"reason", description: "Reason of the ban", required: false, type: "string" }) ]
        });
    }

    async run(call: CommandCall){
        let reason = call.args.reason || "No reason provided.";
        let sent = false;
        let banMessage = `You have been banned from ${call.member.guild.name} \n Reason: "*${reason}*".`;

        let targetMember: GuildMember | false = await call.member.guild.members.fetch({ user: call.args.target, force: true }).catch(_ => false); // force, because d.js permissions sometimes are not synced.
        if (!targetMember) return call.reply({ content: "I can't find that member." });
        let appealbot: boolean = await call.member.guild.members.fetch({ user: '868957041912320072' }).then(_ => true).catch(_ => false);

        if (call.member.guild.ownerId == targetMember.id) return call.reply({ content: "You can't ban the server owner." });
        if (!targetMember.bannable) return call.reply({ content: "I can't ban that member." });
        if (targetMember.user.id == call.member.user.id) return call.reply({ content: "You can't ban yourself XD" });
        if (appealbot) banMessage += `\nBan appeal: https://appealbot.antonioma.com/g/${targetMember.guild.id}/appeal`;
        if (targetMember.roles.highest.position > call.member.roles.highest.position && call.member.id !== call.member.guild.ownerId) return call.reply({ content: "You need a higher position to ban this member." });

        await targetMember.user.send(banMessage)
            .then(_ => sent = true)
            .catch(_ => sent = false);
        
        targetMember.ban({ reason: `${call.member.user.tag}: ${reason}` });

        let embed = new MessageEmbed()
            .setTitle("Ban")
            .setAuthor(call.member.user.tag, call.member.displayAvatarURL())
            .setTimestamp(new Date())
            .setDescription(`${targetMember.user.tag} has been banned.`)
            .addField("Reason", call.args.reason || "*No reason provided.*")
            .addField(`${!appealbot ? 'Ban': 'Appeal'} message`, sent ? "✅" : "❌");

        return call.reply({ embeds: [embed] });
    }
};
export default BanCommand;