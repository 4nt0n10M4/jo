import { GuildMember, MessageEmbed } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class KickCommand extends Command {
    constructor(){
        super({
            aliases: ['kick'],
            description: 'Kick a user in your guild',
            permissions: ["KICK_MEMBERS"],
            args: [ new CommandArg({ name: 'target', description: 'Member to kick', required: true, type: "user" }), new CommandArg({ name:"reason", description: "Reason of the kick", required: false, type: "string" }) ]
        });
    }

    async run(call: CommandCall){
        let reason = call.args.reason || "No reason provided.";
        let sent = false;
        let kickMessage = `You have been kicked from ${call.member.guild.name} \n Reason: "*${reason}*".`;

        let targetMember: GuildMember | false = await call.member.guild.members.fetch({ user: call.args.target, force: true }).catch(_ => false); // force, because d.js permissions sometimes are not synced.
        if (!targetMember) return call.reply({ content: "I can't find that member." });

        if (call.member.guild.ownerId == targetMember.id) return call.reply({ content: "You can't kick the server owner." });
        if (!targetMember.kickable) return call.reply({ content: "I can't kick that member." });
        if (targetMember.user.id == call.member.user.id) return call.reply({ content: "You can't kick yourself XD" });
        if (targetMember.roles.highest.position > call.member.roles.highest.position && call.member.id !== call.member.guild.ownerId) return call.reply({ content: "You need a higher position to kick this member." });

        await targetMember.user.send(kickMessage)
            .then(_ => sent = true)
            .catch(_ => sent = false);

        targetMember.kick(`${call.member.user.tag}: ${reason}`)

        let embed = new MessageEmbed()
            .setTitle("Kick")
            .setAuthor({name: call.member.user.tag, iconURL: call.member.displayAvatarURL()})
            .setTimestamp(new Date())
            .setDescription(`${targetMember.user.tag} has been kicked.`)
            .addField("Reason", call.args.reason || "*No reason provided.*")
            .addField("Kick message", sent ? "✅" : "❌");

        return call.reply({ embeds: [embed] });
    }
};
export default KickCommand;
