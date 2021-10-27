import { ChannelType } from "../types/misc";
type ArgChoice = [string, any]
type ArgType =
    'string' // Just a argument that may be delimited by ""
    | 'content' // The entire content of the message (without the prefix and cmd)
    | 'user' | 'role' | 'channel' | 'choice'

class CommandArg{
    constructor({name, description, required = false, type, defaultValue, channelTypes, choices}: {name: string, description: string, required: boolean, type: ArgType, defaultValue?: string | boolean, channelTypes?: ChannelType[], choices?: ArgChoice[]}){
        this.name = name;
        this.description = description;
        this.required = required;
        this.type = type;
        this.defaultValue = defaultValue;
        this.choices = choices;
        if(this.type == 'channel')this.channelTypes = channelTypes;
    }

    public name: string;
    public description: string;
    public required: boolean;
    public type: ArgType;
    public defaultValue?: string | boolean;
    public channelTypes?: ChannelType[];
    public choices?: ArgChoice[]
}

export default CommandArg;