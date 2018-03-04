import { SendableMessage } from "../types/discord/channel/message";
import { GuildMemberRecord, UserRecord, GuildRecord, MessageRecord } from "../records";
import { TextChannel, DMChannel } from "../classes/channel";
import { PublicDispatcher } from "../util/Dispatcher";
import { EventEmitter } from "events";
import { CommandBuilder, RacecordCommandBuilder } from "./CommandBuilder";

export interface MessageEvent {
    delete(): Promise<void>;
    reply(content: string, data?: SendableMessage): Promise<MessageRecord>;
    success(): Promise<void>;
    command: string;
    args: string[];
    user: UserRecord;
    member?: GuildMemberRecord;
    channel: TextChannel | DMChannel;
    guild?: GuildRecord;
    message: MessageRecord;
}

export type CommandHandler = (messageEvent: MessageEvent, next: () => void) => void;

export interface Command {
    opts: {
        name: string;
        guards?: CommandHandler[];
    };
    handler: CommandHandler;
}

export declare interface Commander {
    on(event: "message", handler: (event: MessageEvent) => any): this;
    on(event: string, handler: (event: MessageEvent) => any): this;
}

/** A lightweight command utility */
export class Commander {

    private commands: {[key: string]: CommandHandler} = {};

    public constructor(private prefix: string) {
        PublicDispatcher.register(action => action.type === "MESSAGE_CREATE" && this.handleMessage(action.data));
    }

    /**
     * Register a command or commands with this commander
     * @param commands the command(s)
     */
    public register(commands: Array<Command | RacecordCommandBuilder> | (Command | RacecordCommandBuilder)) {
        if (!Array.isArray(commands)) {
            commands = [commands];
        }
        for (let command of commands) {
            if (command instanceof RacecordCommandBuilder) {
                command = command.built;
            }
            if (!command.opts.guards || command.opts.guards.length === 0) {
                this.commands[command.opts.name] = command.handler;
                continue;
            }
            this.commands[command.opts.name] = event => {
                let current: number = 0;
                let previous: any;
                const next: () => void = () => {
                    const guard = ((command as Command).opts.guards as CommandHandler[])[current++];
                    if (!guard || previous === guard) {
                        (command as Command).handler(event, undefined as any);
                        return;
                    }
                    previous = guard;
                    guard(event, next);
                }
                next();
            };
        }
    }

    /**
     * Handles a message event
     * @param message the message event to handle
     */
    private async handleMessage(message: MessageRecord) {
        if (!message.content.startsWith(this.prefix)) {
            return;
        }
        const [command, ...args] = message.content.substring(this.prefix.length).split(" ");
        this.dispatchMessage({
            delete: () => message.delete(),
            reply: (content: string, data?: SendableMessage) => message.channel.sendMessage({content, ...(data || {})}),
            success: () => message.react("🆗"),
            command,
            args,
            user: message.author,
            member: message.member,
            channel: message.channel,
            guild: message.guild,
            message
        });
    }

    /**
     * Dispatch a message to its command
     * @param event the message
     */
    private async dispatchMessage(event: MessageEvent) {
        const command = this.commands[event.command];
        if (!command) {
            return;
        }
        command(event, undefined as any);
    }
}