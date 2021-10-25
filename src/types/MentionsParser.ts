import { Guild } from 'discord.js'
import BotClient from './Client';
import { isOnSnowflakeRange } from './misc';

class MentionsParser {
    constructor(client: BotClient){
        this.client = client;
    }

    public client: BotClient;

    private getIdFromStringUsingRegex(regex: RegExp, string: string){
        let matches = string.match(regex);
        if(!matches) return undefined;
        
        let id = matches[1];
        return isOnSnowflakeRange(id) ? id : undefined;
    }

    async user(str: string){
        let id = this.getIdFromStringUsingRegex(/^<@!?(\d+)>$/, str);
        if(id)return await this.client.users.fetch(id);
    }

    async role(str: string, guild: Guild){
        let id = this.getIdFromStringUsingRegex(/^<@&(\d+)>$/, str);
        if(id)return await guild.roles.fetch(id)
    }

    async channel(str: string, guild: Guild){
        let id = this.getIdFromStringUsingRegex(/^<#(\d+)>$/, str);
        if(id)return await guild.channels.fetch(id)
    }

    async userByMentionOrId(str: string){
        let r = await this.user(str);
        if(r)return r;
        if(!isOnSnowflakeRange(str))throw new Error("Invalid snowflake");
        
        try {
            r = await this.client.users.fetch(str);
            if(r)return r;
        } catch (e){
            this.client.logger.debug({file: 'MentionsParser', fnc: 'userByMentionOrId', input: str}, 'Unknown user', e);
            throw new Error("Unknown User");
        }
    }

    async roleByMentionOrId(str: string, guild: Guild){
        let r = await this.role(str, guild);
        if(r)return r;
        if(!isOnSnowflakeRange(str))throw new Error("Invalid snowflake");

        r = await guild.roles.fetch(str);
        if(r == null)throw new Error("Unknown role"); // Why is this fetch different? (it returns null if not found instead of an error)
        return r;
    }

    async channelByMentionOrId(str: string, guild: Guild){
        let r = await this.channel(str, guild);
        if(r)return r;
        if(!isOnSnowflakeRange(str))throw new Error("Invalid snowflake");
        
        try {
            r = await guild.channels.fetch(str);
            if(r)return r;
        } catch(e){
            this.client.logger.debug({file: 'MentionsParser', fnc: 'channelByMentionOrId', input: str}, 'Unknown channel', e);
            throw new Error("Unknown channel");
        }
        return r;
    }
}

export default MentionsParser;