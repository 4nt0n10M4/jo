import { TextChannel, ThreadChannel } from 'discord.js';
import Command from '../types/Command';
import CommandArg from '../types/CommandArg';
import CommandCall from "../types/CommandCall";
const humanizeDuration = require("humanize-duration");

class SlowmodeCommand extends Command {
    constructor(){
        super({
            aliases: ['slowmode', 'slow'],
            description: 'Change slowmode settings for a channel.',
            permissions: ["MANAGE_CHANNELS"],
            args: [
                new CommandArg({ name: "duration", description: "Amount of seconds a user has to wait before sending another message.", required: true, type: "duration", durationUnits: 's' }),
            ]
        });
    }

    async run(call: CommandCall){
        let duration = call.args.duration;
        if(duration > 0 && duration < 0.999) duration *= 1e3; // by default (if not s/m/w etc is set) is parsed as miliseconds but we want seconds.

        if(duration > 6 /* hours a day */ * 60 /* minutes each hour */ * 60 /* secs per minute */){
            throw new Error('Duration cannot be longer than 6 hours.'); // Discord's max rate_limit_per_user duration is 6 hours https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel
        }

        let channel = call._source.channel;
        if(!channel) throw new Error('Error getting target channel.');
        if(!(channel instanceof TextChannel || channel instanceof ThreadChannel)) return call.reply({ content: 'Slowmode cannot be set on this channel.' });

        await channel.setRateLimitPerUser(duration, `${call.member.user.tag}: Slowmode changed from ${channel.rateLimitPerUser == 0 ? 'disabled' : humanizeDuration((channel.rateLimitPerUser||0) * 1e3)} to ${duration == 0 ? 'disabled' : humanizeDuration(duration * 1e3)}`);

        return call.reply({ content: `✅ Slowmode ${duration == 0 ? 'disabled': 'changed to ' + humanizeDuration(duration * 1e3)}.` });
    }
};

export default SlowmodeCommand;