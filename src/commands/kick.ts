import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class KickCommand extends Command {
    constructor(){
        super({
            aliases: ['kick'],
            description: 'Kick a user in your guild',
            permissions: ["KICK_MEMBERS"],
            args: [new CommandArg({name: 'target', description: 'member to kick', required: true, type: "user"}), new CommandArg({name:"reason",description:"reason of the kick", required: false, type:"string"})]
        });
    }

    async run(call: CommandCall){
        var reason = call.args.reason || "No reason provided."
        var sent: "✅"|"❌" = "❌"
        var member: GuildMember | false 
        var banMessage = `You have been kicked from ${call.member.guild.name} \n Reason: "*${reason}*".`

        try {member = await call.member.guild.members.fetch(call.args.target.id);} catch (e) {member = false}

        if (!member) return call.reply({content:"I can't find the member."})
        if (call.member.guild.ownerId == member.id ) return call.reply({content:"You can't kick the server owner."})
        if (!member.kickable) return call.reply({content:"I can't kick this member."})
        if (member.user.id == call.member.user.id) return call.reply({content:"You can't kick yourself XD"})
        if (member.roles.highest.position > call.member.roles.highest.position) return call.reply({content:"You need a highest position to kick this member."})
        await member.user.send(banMessage)
            .then(_=>sent = "✅")
            .catch(_=> sent = "❌")
        
        member.kick(reason)

        const embed = new MessageEmbed()
        embed.setTitle("Kick")
        embed.setAuthor(call.member.user.tag, call.member.displayAvatarURL())
        embed.setTimestamp(new Date())
        embed.setDescription(`${member.user.tag} has been kicked.`)
        embed.addField("Reason", reason)
            embed.addField("Kick message", sent)
        return call.reply({embeds:[embed]})
    }
};
export default KickCommand;