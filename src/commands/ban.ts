import { GuildMember, MessageEmbed } from 'discord.js';
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
        const translate = call.translate.bind(call);

        let reason = call.args.reason || translate("default_reason");
        let sent = false;
        let banMessage = translate("ban_message", { guild: call.member.guild.name, reason });

        let targetMember: GuildMember | false = await call.member.guild.members.fetch({ user: call.args.target, force: true }).catch(_ => false); // force, because d.js permissions sometimes are not synced.
        if (!targetMember) return call.reply({ content: translate("no_target") });
        let appealbot: boolean = await call.member.guild.members.fetch({ user: '868957041912320072' }).then(_ => true).catch(_ => false);

        if (call.member.guild.ownerId == targetMember.id) return call.reply({ content: translate("target_owner") });
        if (!targetMember.bannable) return call.reply({ content: translate("unbanable") });
        if (targetMember.user.id == call.member.user.id) return call.reply({ content: translate("target_yourself") });
        if (appealbot) banMessage += `\nBan appeal: https://appealbot.antonioma.com/g/${targetMember.guild.id}/appeal`;
        if (targetMember.roles.highest.position > call.member.roles.highest.position && call.member.id !== call.member.guild.ownerId) return call.reply({ content: translate("lower_role") });

        await targetMember.user.send(banMessage)
            .then(_ => sent = true)
            .catch(_ => sent = false);
        
        targetMember.ban({ reason: `${call.member.user.tag}: ${reason}` });

        let embed = new MessageEmbed()
            .setTitle("Ban")
            .setAuthor({name: call.member.user.tag, iconURL: call.member.displayAvatarURL()})
            .setTimestamp(new Date())
            .setDescription(translate("embed_description",  { target: targetMember.user.tag }))
            .addField("Reason", reason)
            .addField(`${!appealbot ? 'Ban': 'Appeal'} message`, sent ? "✅" : "❌");

        return call.reply({ embeds: [embed] });
    }
};
export default BanCommand;