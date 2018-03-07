import { SendableMessage } from "../types/discord/channel/message";
import { UserRecord, GuildMemberRecord, GuildRecord, MessageRecord, ChannelRecord } from "../records";
import { DMChannel, TextChannel } from "../classes/channel";

export type CommandArgument = string | number | boolean | UserRecord | ChannelRecord | GuildMemberRecord | GuildRecord;
export interface MessageEvent {
    delete(): Promise<void>;
    reply(content: string, data?: SendableMessage): Promise<MessageRecord>;
    success(): Promise<void>;
    command: string;
    args: CommandArgument[];
    user: UserRecord;
    member?: GuildMemberRecord;
    channel: TextChannel | DMChannel;
    guild?: GuildRecord;
    message: MessageRecord;
}

export type CommandHandler = (messageEvent: MessageEvent, next: () => void) => void;
export type CommandMiddleware = (messageEvent: MessageEvent, command: CommandMetadata, next: () => void) => void;

export type ClassOf<T> = new(...args: any[]) => T;
export type RawArgumentType = ClassOf<String> | ClassOf<Number> | ClassOf<Boolean> | ClassOf<UserRecord> | ClassOf<ChannelRecord> | ClassOf<GuildMemberRecord> | ClassOf<GuildRecord> | ((arg: string) => boolean);
export type Argument = {
    name?: string;
    description?: string;
    optional?: boolean;
    infinite?: boolean;
    type: ClassOf<String> | ClassOf<Number> | ClassOf<Boolean> | ClassOf<UserRecord> | ClassOf<ChannelRecord> | ClassOf<GuildMemberRecord> | ClassOf<GuildRecord> | ((arg: string) => boolean);
} | RawArgumentType;

export function isRawType(arg: Argument): arg is RawArgumentType {
    return !((arg as any).prototype);
}

export interface Command {
    opts: {
        guards?: CommandHandler[];
    } & CommandMetadata;
    handler: CommandHandler;
}

export interface CommandMetadata {
    name: string;
    description?: string[];
    args?: Argument[];
}