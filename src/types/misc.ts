import { Snowflake } from "discord.js/typings/index.js";
type ArgChoice = [string, any]
interface Args {
    [key: string]: any
}

function capitalize(str: string) : string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function isOnSnowflakeRange(snowflake_str: Snowflake){
    try{
        let snowflake = BigInt(snowflake_str)
        return(snowflake>0 && snowflake<BigInt("9223372036854775807"));
    } catch(e){
        return false;
    }
}

type ChannelType = "GUILD_TEXT" |
    "DM" |
    "GUILD_VOICE" |
    "GROUP_DM" |
    "GUILD_CATEGORY" |
    "GUILD_NEWS" |
    "GUILD_STORE" |
    "GUILD_NEWS_THREAD" |
    "GUILD_PUBLIC_THREAD" |
    "GUILD_PRIVATE_THREAD" |
    "GUILD_STAGE_VOICE"

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

export { Args, capitalize, isOnSnowflakeRange, ChannelType, toSnakeCase, CommandNotFoundError, InvalidChannelTypeError, ArgChoice, InvalidChoiceError }