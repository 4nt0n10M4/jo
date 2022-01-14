import { CommandInteraction, GuildMember, InteractionReplyOptions, Message } from "discord.js/typings";
import BotClient from "./Client";
import Command from "./Command";
import CommandCallDbHelper from "./CommandCallDbHelper";
import { Args, CommandNotFoundError } from "./misc";

type CallType = 'Message' | 'SlashCommand'

class CommandCall {
    constructor({client, _type, command, args, member, _source}: {client: BotClient, _type: CallType, command: string | Command, args: Args, member: GuildMember, _source: CommandInteraction | Message}){
        this.client = client;
        this._type = _type;
        this._source = _source;
        this.member = member;
        this.args = args;

        this.db = new CommandCallDbHelper(this);

        if(command instanceof Command){
            this.command = command;
        } else {
            try {
                this.command = this.client.commandHandler.getCmd(command);
            } catch(e){
                this.client.logger.debug({file: 'CommandCall', fnc: 'constructor', cmdName: command}, `Command not found`, e);
                throw new CommandNotFoundError(`[CommandCall] Command ${command} not found.`);
            }
        }
    }

    public client: BotClient;
    public _type: CallType;
    public command: Command;
    public args: Args;
    public member: GuildMember;
    public _source: CommandInteraction | Message;
    public db: CommandCallDbHelper;

    reply(options: InteractionReplyOptions){
        if(options.ephemeral && this._type == 'Message') delete options.ephemeral;

        let msgs = [options];
        if(options.content && options.content?.length > 2000){
            msgs = this._splitMsg(options.content, 2000).map(fragment => ({...options, content: fragment}));
        }

        return msgs.map(msg => this._source.reply(msg));
    }

    // TODO: Make this don't break in the middle of lines & keep the format after the split.
    private _splitMsg(str: string, max: number){
        let chunks = [];

        for (var i = 0, charsLength = str.length; i < charsLength; i += max) {
            chunks.push(str.substring(i, i + max));
        }

        return chunks;
    }
}

export default CommandCall;
