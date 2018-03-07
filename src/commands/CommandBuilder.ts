import { CommandHandler, Command, Argument } from "./Commander";
import { GuildRecord, ChannelRecord, UserRecord, GuildMemberRecord } from "../records";

export class RacecordCommandBuilder {
    private _name: string;
    private _guards: CommandHandler[] = [];
    private _handler: CommandHandler | undefined;
    private _args: Argument[] = [];

    /**
     * Set the name of this command
     * @param name the name
     */
    public name(name: string) {
        this._name = name;
        return this;
    }

    /**
     * Adds argument definitions to this command
     * @param arg the argument definitions
     */
    public args(arg: Argument | Argument[]) {
        this._args = this._args.concat(arg);
        return this;
    }

    /**
     * Sets the guards for this command
     * @param guard the guards
     */
    public use(guard: CommandHandler | CommandHandler[]) {
        if (Array.isArray(guard)) {
            this._guards = this._guards.concat(guard);
        } else {
            this._guards.push(guard);
        }
        return this;
    }

    /**
     * Sets the executor for this command
     * @param handler the executor
     */
    public handler(handler: CommandHandler | undefined): this {
        this._handler = handler;
        return this;
    }

    /**
     * The assembled command
     */
    public get built(): Command {
        return {
            opts: {
                name: this._name,
                guards: this._guards,
                args: this._args,
            },
            handler: this._handler as CommandHandler
        }
    }
}

export const CommandBuilder = {
    /**
     * Set the name of this command
     * @param name the name
     */
    name(name: string) {
        return new RacecordCommandBuilder().name(name);
    },
    /**
     * Sets the guards for this command
     * @param guard the guards
     */
    use(guard: CommandHandler | CommandHandler[]) {
        return new RacecordCommandBuilder().use(guard);
    },
    /**
     * Sets the executor for this command
     * @param handler the executor
     */
    handler(handler: CommandHandler | undefined) {
        return new RacecordCommandBuilder().handler(handler);
    },
    /**
     * Adds argument definitions to this command
     * @param arg the argument definitions
     */
    args(arg: Argument | Argument[]) {
        return new RacecordCommandBuilder().args(arg);
    }
}