import { SendableMessage } from "../types/discord/channel/message";
import { GuildMemberRecord, UserRecord, GuildRecord, MessageRecord } from "../records";
import { TextChannel, DMChannel } from "../classes/channel";
import { PublicDispatcher } from "../util/Dispatcher";
import { EventEmitter } from "events";

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

export class Commander extends EventEmitter {

    private commands: {[key: string]: CommandHandler};

    public constructor(private prefix: string) {
        super();
        PublicDispatcher.register(action => action.type === "MESSAGE_CREATE" && this.handleMessage(action.data));
        this.on("message", event => {
            const command = this.commands[event.command];
            if (!command) {
                return;
            }
            command(event, undefined as any);
        });
    }

    public registerCommand(command: Command) {
        this.registerCommands([command]);
    }

    public registerCommands(commands: Command[]) {
        for (const command of commands) {
            if (!command.opts.guards) {
                this.commands[command.opts.name] = command.handler;
                continue;
            }
            this.commands[command.opts.name] = event => {
                let current: number = 0;
                let previous: any;
                const next: () => void = () => {
                    const guard = (command.opts.guards as CommandHandler[])[current++];
                    if (!guard || previous === guard) {
                        command.handler(event, undefined as any);
                        return;
                    }
                    previous = guard;
                    guard(event, next);
                }
                next();
            };
        }
    }

    private async handleMessage(message: MessageRecord) {
        if (!message.content.startsWith(this.prefix)) {
            return;
        }
        const [command, ...args] = message.content.substring(this.prefix.length).split(" ");
        this.emit("message", {
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
}