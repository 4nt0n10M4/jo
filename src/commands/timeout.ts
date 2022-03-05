import { GuildMember, MessageEmbed } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";
const humanizeDuration = require("humanize-duration");

class TimeoutCommand extends Command {
    constructor(){
        super({
            aliases: ['timeout'],
            description: 'Timeout a user from your guild',
            permissions: ["MODERATE_MEMBERS"],
            args: [
                new CommandArg({ name: 'target', description: 'Member to timeout', required: true, type: "user" }),
                new CommandArg({ name: "duration", description: "Duration of the timeout", required: true, type: "duration" }),
                new CommandArg({ name: "reason", description: "Reason of the timeout", required: false, type: "string" })
            ]
        });
    }

    async run(call: CommandCall){
        const translate = call.translate.bind(call);
        let reason = call.args.reason || translate("default_reason");
        let duration = call.args.duration;

        if(duration > 28 /* days */ * 24 /* hours a day */ * 60 /* minutes each hour */ * 60 /* secs per minute */ * 1e3 /* ms per sec */){
            throw new Error(translate("invalid_duration")); // Discord's max timeout duration is 28 days https://discord.com/developers/docs/resources/guild#modify-guild-member
        }

        let targetMember: GuildMember | false = await call.member.guild.members.fetch({ user: call.args.target, force: true }).catch(_ => false); // force, because d.js permissions sometimes are not synced.
        if (!targetMember) return call.reply({ content: translate("no_target") });

        if (call.member.guild.ownerId == targetMember.id) return call.reply({ content: translate("target_owner") });
        if (!targetMember.moderatable) return call.reply({ content: translate("unmoderatable") });
        if (targetMember.user.id == call.member.user.id) return call.reply({ content: translate("target_yourself") });
        if (targetMember.roles.highest.position > call.member.roles.highest.position && call.member.id !== call.member.guild.ownerId) return call.reply({ content: translate("lower_role") });

        targetMember.timeout(duration, `${call.member.user.tag}: ${reason}`);

        let embed = new MessageEmbed()
            .setTitle("Timeout")
            .setAuthor({name: call.member.user.tag, iconURL: call.member.displayAvatarURL()})
            .setTimestamp(new Date())
            .setDescription(translate("embed_description", {target: targetMember.user.tag}))
            .addField("Reason", reason)
            .addField("Duration", humanizeDuration(duration));

        return call.reply({ embeds: [embed] });
    }
};

export default TimeoutCommand;