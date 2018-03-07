import { SendableMessage } from "../types/discord/channel/message";
import { GuildMemberRecord, UserRecord, GuildRecord, MessageRecord } from "../records";
import { TextChannel, DMChannel } from "../classes/channel";
import { PublicDispatcher } from "../util/Dispatcher";
import { EventEmitter } from "events";
import { CommandBuilder, RacecordCommandBuilder } from "./CommandBuilder";
import { CommandHandler, Command, MessageEvent, CommandMetadata, CommandMiddleware } from "./Command";

export * from "./Command";

export declare interface Commander {
    on(event: "message", handler: (event: MessageEvent) => any): this;
    on(event: string, handler: (event: MessageEvent) => any): this;
}

/**
 * A lightweight command utility
 * 
 * Argument parsing is NOT built into Commander. Use a middleware for this (an argument parser middleware is shipped with this)
 */
export class Commander {

    private commandHandlers: {[key: string]: CommandHandler} = {};
    private commandMetadata: {[key: string]: CommandMetadata} = {};
    private middleware: CommandMiddleware[] = [];

    public constructor(private prefix: string) {
        PublicDispatcher.register(action => action.type === "MESSAGE_CREATE" && this.handleMessage(action.data));
    }

    public use(middleware: CommandMiddleware) {
        this.middleware.push(middleware);
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
            this.commandMetadata[command.opts.name] = command.opts;
            if (!command.opts.guards || command.opts.guards.length === 0) {
                this.commandHandlers[command.opts.name] = command.handler;
                continue;
            }
            this.commandHandlers[command.opts.name] = event => {
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
     * A dictionary of command-name to command-metadata
     */
    public get commands(): {[key: string]: CommandMetadata} {
        return this.commandMetadata;
    }

    /**
     * Handles a message event
     * @param message the message event to handle
     */
    private async handleMessage(message: MessageRecord) {
        if (!message.content.startsWith(this.prefix)) {
            return;
        }
        const res = message.content.substring(this.prefix.length).match(/\w+|"[^"]*"/g);
        if (res === null) {
            return;
        }
        const [command, ...args] = res;
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            if (arg.startsWith('"') && arg.endsWith('"')) args[i] = arg.substring(1, arg.length - 1);
        }
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
        const command = this.commandHandlers[event.command];
        if (!command) {
            return;
        }
        if (this.shouldRunMiddleware) {
            await this.runMiddlware(event);
        }
        command(event, undefined as any);
    }

    private get shouldRunMiddleware(): boolean {
        return this.middleware.length !== 0;
    }

    /**
     * Runs middleware on a command
     */
    private runMiddlware(messageEvent: MessageEvent): Promise<void> {
        return new Promise((resolve, reject) => {
            let current: number = 0;
            let previous: any;
            const metadata = this.commandMetadata[messageEvent.command];
            const next: () => void = () => {
                const guard = (this.middleware)[current++];
                if (!guard || previous === guard) {
                    resolve();
                    return;
                }
                previous = guard;
                guard(messageEvent, metadata, next);
            }
            next();
        });
    }
}