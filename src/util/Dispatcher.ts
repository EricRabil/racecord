import {ActionType, ActionTypes, RawAction, BaseAction} from "../types/structures/action";
import { EventEmitter } from "events";
import { ChannelRecord, GuildRecord, BanRecord, GuildMemberRecord, RoleRecord, MessageRecord, UserRecord } from "../records";
import { RawReaction, RawVoiceState } from "../types/raw";
import { Presence } from "../types/discord/user/presence";

/**
 * @private
 * A very lightweight event system, used by internal components
 * 
 * This dispatching system is 100% asynchronous. Multiple events can be dispatched at the same time.
 */
export class RacecordDispatcher<T extends RawAction> {

    /**
     * A map of unique IDs to listeners
     */
    private listenerMap: {[key: string]: (action: T) => any} = {};

    /**
     * Dispatch an event to all listeners
     * @param action the action to dispatch
     */
    public async dispatch(action: T) {
        for (const id in this.listenerMap) {
            (async () => this.listenerMap[id](action))();
        }
    }

    /**
     * Registers a listener with this dispatcher
     * @param listener the listener to register
     * @returns the unique ID if you plan on de-registering later
     */
    public register(listener: (action: T) => any): string {
        const key = this.nextKey;
        this.listenerMap[key] = listener;
        return key;
    }

    /**
     * Deregisters a listener using the unique ID registered previously
     * @param key the key to deregister
     */
    public unregister(key: string): void {
        delete this.listenerMap[key];
    }

    /**
     * The next unique key to use
     */
    private get nextKey(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * An array of listeners
     */
    private get listeners(): Array<(action: T) => any> {
        return Object.values(this.listenerMap);
    }
}

/**
 * @private
 * The internal dispatcher - raw gateway events will be dispatched here
 */
export const Dispatcher: RacecordDispatcher<BaseAction> = new RacecordDispatcher();

export type DiscordAction = {
    type: "CHANNEL_CREATE" | "CHANNEL_UPDATE" | "CHANNEL_DELETE";
    data: ChannelRecord;
} | {
    type: "GUILD_CREATE" | "GUILD_UPDATE" | "GUILD_DELETE";
    data: GuildRecord;
} | {
    type: "GUILD_BAN_ADD" | "GUILD_BAN_REMOVE";
    data: BanRecord;
} | {
    type: "GUILD_EMOJIS_UPDATE";
    data: GuildRecord;
} | {
    type: "GUILD_MEMBER_ADD" | "GUILD_MEMBER_REMOVE" | "GUILD_MEMBER_UPDATE";
    data: GuildMemberRecord;
} | {
    type: "GUILD_ROLE_CREATE" | "GUILD_ROLE_DELETE" | "GUILD_ROLE_UPDATE";
    data: RoleRecord;
} | {
    type: "MESSAGE_CREATE" | "MESSAGE_UPDATE" | "MESSAGE_DELETE";
    data: MessageRecord;
} | {
    type: "MESSAGE_REACTION_ADD" | "MESSAGE_REACTION_REMOVE";
    data: {
        message: MessageRecord;
        reaction: RawReaction;
    };
} | {
    type: "MESSAGE_REACTION_REMOVE_ALL";
    data: MessageRecord;
} | {
    type: "PRESENCE_UPDATE";
    data: {
        user: UserRecord;
        guild?: GuildRecord;
        roles?: RoleRecord[];
    } & Presence;
} | {
    type: "TYPING_START" | "TYPING_STOP";
    data: {
        channel: ChannelRecord;
        user: UserRecord;
        member?: GuildMemberRecord;
        timestamp: Date;
    };
} | {
    type: "USER_UPDATE";
    data: UserRecord;
} | {
    type: "VOICE_STATE_UPDATE";
    data: RawVoiceState;
} | {
    type: "WEBHOOKS_UPDATE";
    data: {
        guild: GuildRecord;
        channel: ChannelRecord;
    }
};

/**
 * The public dispatcher - Racecord will dispatch gateway events here but with records instead of rawtypes
 */
export const PublicDispatcher: RacecordDispatcher<DiscordAction> = new RacecordDispatcher();
