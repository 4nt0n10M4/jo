import { Snowflake } from "discord.js/typings/index.js";
import { ChannelType } from "discord-api-types/v9";

type ArgChoice = [string, any];

interface Args {
    [key: string]: any
}

function capitalize(str: string) : string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDateMDY(Originaldate: Date): string {
    var d = new Date(Originaldate),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

function isOnSnowflakeRange(snowflake_str: Snowflake){
    try{
        let snowflake = BigInt(snowflake_str)
        return(snowflake>0 && snowflake<BigInt("9223372036854775807"));
    } catch(e){
        return false;
    }
}

function filterObject(obj: object, callback: (key: string, value: any) => boolean){
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([key, val]) => callback(val, key)
        )
    );
}

let ChannelTypeNameToChannelType = {
    [ChannelType.GuildText]: "GUILD_TEXT",
    [ChannelType.DM]: "DM",
    [ChannelType.GuildVoice]: "GUILD_VOICE",
    [ChannelType.GroupDM]: "GROUP_DM",
    [ChannelType.GuildCategory]: "GUILD_CATEGORY",
    [ChannelType.GuildNews]: "GUILD_NEWS",
    [ChannelType.GuildStore]: "GUILD_STORE",
    [ChannelType.GuildNewsThread]: "GUILD_NEWS_THREAD",
    [ChannelType.GuildPublicThread]: "GUILD_PUBLIC_THREAD",
    [ChannelType.GuildPrivateThread]: "GUILD_PRIVATE_THREAD",
    [ChannelType.GuildStageVoice]: "GUILD_STAGE_VOICE"
}

let ChannelTypeForSlashCommandArgumentToChannelName = filterObject(ChannelTypeNameToChannelType, (type, name) => { return !['DM', 'GROUP_DM'].includes(name) });

type ChannelTypeForSlashCommandArgument = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;

function toSnakeCase(str: string) {
    return str.split('').map((character) => {
        if (character == character.toUpperCase()) {
            return '_' + character.toLowerCase();
        } else {
            return character;
        }
    })
    .join('');
}

class CommandNotFoundError extends Error{
    constructor(message: string){
        super(message);
        this.name = 'CommandNotFoundError';
    }
}

class InvalidChannelTypeError extends Error{
    constructor(message: string){
        super(message);
        this.name = 'InvalidChannelTypeError';
    }
}

class InvalidChoiceError extends Error{
    constructor(message: string, choices: ArgChoice[]){
        super(message);
        this.name = 'InvalidChoiceError';
        this.choices = choices;
    }

    public choices: ArgChoice[];

    toString(){
        return `${this.name}: ${this.message}\nAvailable choices: ${this.choices.map(choice => choice[0]).join(', ')}.`;
    }
}

export { Args, capitalize, isOnSnowflakeRange, ChannelTypeForSlashCommandArgument, ChannelTypeForSlashCommandArgumentToChannelName, ChannelTypeNameToChannelType, toSnakeCase, CommandNotFoundError, InvalidChannelTypeError, ArgChoice, InvalidChoiceError, formatDateMDY }
