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
            args: [new CommandArg({name: 'target', description: 'member to ban', required: true, type: "user"}), new CommandArg({name:"reason",description:"reason of the ban", required: false, type:"string"})]
        });
    }

    async run(call: CommandCall){
        var reason = call.args.reason || "No reason provided."
        var sent: "✅"|"❎" = "❎"
        var appealbot: Boolean = false 
        
        try {(await call.member.guild.members.fetch("868957041912320072")); appealbot = true } catch(e) { appealbot = false}
        const member = await call.member.guild.members.fetch(call.args.target.id);
        if (call.member.guild.ownerId == member.id ) return call.reply({content:"You can't ban the server owner."})
        if (!member) return call.reply({content:"I can't find the member."})
        if (!member.bannable) call.reply({content:"I can't ban this member."})
        if (member.user.id == call.member.user.id) return call.reply({content:"I can't ban you xd."})
        var banMessage = `You have been banned from ${call.member.guild.name} \n Reason: ${reason}`
        if (appealbot) banMessage += `\n Appeal here: https://appealbot.antonioma.com/g/${member.guild.id}/appeal `
        if (member.roles.highest.position > call.member.roles.highest.position) return call.reply({content:"You need a highest position"})
        await member.user.send(banMessage)
            .then(_=>sent = "✅")
            .catch(_=> sent = "❎")
        
        member.ban({reason})
        const embed = new MessageEmbed()
        embed.setTitle("Ban")
        embed.setAuthor(call.member.user.tag, call.member.displayAvatarURL())
        embed.setTimestamp(new Date())
        embed.setDescription(`${member.user.tag} has been banned.`)
        embed.addField("Reason", reason)
        if (!appealbot) {
            embed.addField("Ban message", sent)
        } else {
            embed.addField("Appeal message", sent)
        }
        return call.reply({embeds:[embed]})
    }
};
export default BanCommand;