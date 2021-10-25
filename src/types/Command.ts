import { GuildMember, NewsChannel, PermissionString, TextBasedChannels, TextChannel, ThreadChannel } from "discord.js";
import type {  } from 'discord.js';
import CommandCall from "./CommandCall";
import CommandArg from "./CommandArg";

interface ArgParserArg {
    [key: string]: {default: string}
}

class Command {
    constructor({aliases, description, permissions = [], noPermsSilent = false, ownerOnly = false, hidden = false, args = []}: {aliases: string[], description?: string, permissions?: PermissionString[], noPermsSilent?: boolean, ownerOnly?: boolean, hidden?: boolean, args?: CommandArg[]}){
        this.aliases = aliases;
        this.description = description;
        this.permissions = permissions;
        this.noPermsSilent = noPermsSilent;
        this.ownerOnly = ownerOnly;
        this.hidden = hidden;
        this.args = args;
    }

    public aliases: string[];
    public description?: string;
    public permissions: PermissionString[];
    public noPermsSilent: boolean;
    public ownerOnly: boolean;
    public hidden: boolean;
    public args: CommandArg[];

    hasPermission(member: GuildMember, channel?: TextChannel | NewsChannel | ThreadChannel | null){
        if(this.ownerOnly && member.id !== process.env.OWNER_ID) return {check: false, missing: ['BOT_OWNER']};
        
        if(channel){
            let check = channel.permissionsFor(member).has(this.permissions);
            return {check, missing: check ? [] : channel.permissionsFor(member).missing(this.permissions)};
        }

        let check = member.permissions.has(this.permissions);
        return {check, missing: check ? [] : member.permissions.missing(this.permissions)};
    }

    run(call: CommandCall) : any {}

    get name(){
        return this.aliases[0];
    }

    get usage(){
        return `${this.name} ${this.args.map(a => `${a.required ? `<` : '['}${a.name}${a.required ? `>` : ']'}`).join(' ')}`;
    }

    get argsExplanation(){
        return this.args.map(a => `${a.required ? '<' : '['}${a.name}:${a.type}${a.type == 'channel' && a.channelTypes ? `(${a.channelTypes})` : ''}${a.required ? '>' : ']'}: ${a.description}`).join(`\n`)
    }

    argsForParser(){
        let args: ArgParserArg = {};
        this.args.forEach(arg => {
            args[arg.name] = {default: (typeof arg.defaultValue == 'string') ? arg.defaultValue : ''};
        });
        return args;
    }
}

export default Command;