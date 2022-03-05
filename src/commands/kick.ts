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
        const translate = call.translate.bind(call);
        
        let reason = call.args.reason || translate("default_reason");
        let sent = false;
        let kickMessage = translate("kick_message", { server: call.member.guild.name, reason });

        let targetMember: GuildMember | false = await call.member.guild.members.fetch({ user: call.args.target, force: true }).catch(_ => false); // force, because d.js permissions sometimes are not synced.
        if (!targetMember) return call.reply({ content: translate("no_target") });

        if (call.member.guild.ownerId == targetMember.id) return call.reply({ content: translate("target_owner") });
        if (!targetMember.kickable) return call.reply({ content: translate("unkickable") });
        if (targetMember.user.id == call.member.user.id) return call.reply({ content: translate("target_yourself") });
        if (targetMember.roles.highest.position > call.member.roles.highest.position && call.member.id !== call.member.guild.ownerId) return call.reply({ content: translate("lower_role") });

        await targetMember.user.send(kickMessage)
            .then(_ => sent = true)
            .catch(_ => sent = false);
        
        targetMember.kick(`${call.member.user.tag}: ${reason}`)

        let embed = new MessageEmbed()
            .setTitle("Kick")
            .setAuthor({name: call.member.user.tag, iconURL: call.member.displayAvatarURL()})
            .setTimestamp(new Date())
            .setDescription(translate("embed_description",  { target: targetMember.user.tag }))
            .addField("Reason", reason)
            .addField("Kick message", sent ? "✅" : "❌");

        return call.reply({ embeds: [embed] });
    }
};
export default KickCommand;