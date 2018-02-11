import keyMirror = require("keymirror");
import { reverseObject } from "../MiscUtils";
import { Presence } from "../../types/discord/user/presence";
import { RawUser } from "../../types/raw/RawUser";
import { RawChannel } from "../../types/raw/RawChannel";
import { UnavailableGuild } from "../../types/raw/UnavailableGuild";

export interface Payload {
    op: number;
    d?: any;
    s?: number;
    t?: string;
}

export interface HelloPayload extends Payload {
    op: 10;
    d: {
        heartbeat_interval: number;
        _trace: string[];
    }
}

export interface HeartbeatAckPayload extends Payload {
    op: 11;
}

export interface InnerIdentifyPayload {
    token: string;
    properties?: {
        $os: string;
        $browser: string;
        $device: string;
    };
    compress: true;
    large_threshold: number;
    shard?: [number, number];
    presence?: Presence;
}

export interface IdentifyPayload extends Payload {
    op: 2;
    d: InnerIdentifyPayload;
}

export interface ResumePayload extends Payload {
    op: 6;
    d: {
        token: string;
        session_id: string;
        seq: number;
    }
}

export interface HeartbeatPayload extends Payload {
    op: 1;
    d: number;
}

export interface RequestGuildMembersPayload extends Payload {
    op: 8;
    d: {
        guild_id: string;
        query: string;
        limit: number;
    }
}

export interface UpdateVoiceStatePayload extends Payload {
    op: 4;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_mute: boolean;
        self_deaf: boolean;
    };
}

export interface UpdateStatusPayload extends Payload {
    op: 3;
    d: Presence;
}

export interface ReadyPayload extends Payload {
    op: 0;
    d: {
        v: number;
        user: RawUser;
        private_channels: RawChannel[];
        guilds: UnavailableGuild[];
        session_id: string;
        _trace: string[];
    }
}

export interface ResumedPayload extends Payload {
    op: 0;
    d: {
        _trace: string[];
    }
}

export interface InvalidSessionPayload extends Payload {
    op: 9;
    d: boolean;
}

export * from "./DispatchEvents";

export const Opcodes = {
    DISPATCH: 0,
    HEARTBEAT: 1,
    IDENTIFY: 2,
    STATUS_UPDATE: 3,
    VOICE_STATE_UPDATE: 4,
    VOICE_SERVER_PING: 5,
    RESUME: 6,
    RECONNECT: 7,
    REQUEST_GUILD_MEMBERS: 8,
    INVALID_SESSION: 9,
    HELLO: 10,
    HEARTBEAT_ACK: 11,
    GUILD_SYNC: 12
};

export const DispatchEvents = keyMirror({
    CHANNEL_CREATE: null,
    CHANNEL_UPDATE: null,
    CHANNEL_DELETE: null,
    CHANNEL_PINS_UPDATE: null,
    GUILD_CREATE: null,
    GUILD_UPDATE: null,
    GUILD_DELETE: null,
    GUILD_BAN_ADD: null,
    GUILD_BAN_REMOVE: null,
    GUILD_EMOJIS_UPDATE: null,
    GUILD_INTEGRATIONS_UPDATE: null,
    GUILD_MEMBER_ADD: null,
    GUILD_MEMBER_REMOVE: null,
    GUILD_MEMBER_UPDATE: null,
    GUILD_MEMBERS_CHUNK: null,
    GUILD_ROLE_CREATE: null,
    GUILD_ROLE_UPDATE: null,
    GUILD_ROLE_DELETE: null,
    MESSAGE_CREATE: null,
    MESSAGE_UPDATE: null,
    MESSAGE_DELETE: null,
    MESSAGE_DELETE_BULK: null,
    MESSAGE_REACTION_ADD: null,
    MESSAGE_REACTION_REMOVE: null,
    MESSAGE_REACTION_REMOVE_ALL: null,
    PRESENCE_UPDATE: null,
    READY: null,
    RESUMED: null,
    TYPING_START: null,
    USER_UPDATE: null,
    VOICE_STATE_UPDATE: null,
    VOICE_SERVER_UPDATE: null,
    WEBHOOKS_UPDATE: null
});

export const CloseCodes = {
    UNKNOWN_ERROR: 4000,
    UNKNOWN_OPCODE: 4001,
    DECODE_ERROR: 4002,
    NOT_AUTHENTICATED: 4003,
    AUTHENTICATION_FAILED: 4004,
    ALREADY_AUTHENTICATED: 4005,
    INVALID_SEQUENCE: 4007,
    RATE_LIMIT: 4008,
    SESSION_TIMEOUT: 4009,
    INVALID_SHARD: 4010,
    SHARD_REQUIRED: 4011
};

export const CloseEvents = keyMirror(CloseCodes);
export const CloseEventsMap = reverseObject(CloseCodes);
export const GatewayEvents = keyMirror(Opcodes);
export const GatewayEventsMap = reverseObject(Opcodes);