import { MessageEmbed, User } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";

class AvatarCommand extends Command {
    constructor(){
        super({
            aliases: ['avatar'],
            description: 'Shows the avatar of a user',
            args:[new CommandArg({
                name: 'user',
                description: 'The user to show the avatar of',
                required: false,
                type: 'user',
            })]
        });
    }

    async run(call: CommandCall){
        const user: User = call.args['user'] || call._source.member?.user;

        if(call._source.guild) {
            const member = await call._source.guild.members.fetch(user.id);

            const animatedPFP = member.displayAvatarURL({ dynamic: true, size: 2048 });
            const staticPFP = member.displayAvatarURL({ format: 'png', size: 2048 });
            const userPFP = member.user.displayAvatarURL({ dynamic: true, size: 2048 });
            const jpgPFP = member.user.displayAvatarURL({ format: 'jpg', size: 2048 });
            
            const replyEmbed = new MessageEmbed()
                .setAuthor({ name: user.tag, iconURL: userPFP })
                .setImage(animatedPFP)
                .setDescription(`${animatedPFP.endsWith('.gif?size=2048') ? `[GIF](${animatedPFP}) | ` : ''}[PNG](${staticPFP}) | ${member.avatar ? `[USER](${userPFP})` : `[JPG](${jpgPFP})`}`)
                .setColor(user.accentColor || '#7289da');

            return call.reply({embeds: [replyEmbed]});
        } else {
            const animatedPFP = user.displayAvatarURL({ dynamic: true, size: 2048 });
            const staticPFP = user.displayAvatarURL({ format: 'png', size: 2048 });
            const jpgPFP = user.displayAvatarURL({ format: 'jpg', size: 2048 });

            const replyEmbed = new MessageEmbed()
                .setAuthor({ name: user.tag, iconURL: animatedPFP })
                .setImage(animatedPFP)
                .setDescription(`[PNG](${staticPFP}) | [JPG](${jpgPFP})`)
                .setColor(user.accentColor || '#7289da');
            
            return call.reply({embeds: [replyEmbed]});
        }
    }
};

export default AvatarCommand;