import { Payload } from "./GatewayEvents";
import { RawChannel } from "../../types/raw/RawChannel";
import { RawGuild, RawGuildSelector } from "../../types/raw/RawGuild";
import { UnavailableGuild } from "../../types/raw/UnavailableGuild";
import { RawUser } from "../../types/raw/RawUser";
import { RawEmoji } from "../../types/raw/RawEmoji";
import { RawGuildMember } from "../../types/raw/RawGuildMember";
import { RawRole } from "../../types/raw/RawRole";
import { RawMessage } from "../../types/raw/RawMessage";
import { Presence } from "../../types/discord/user/presence";
import { RawVoiceState } from "../../types/raw/RawVoiceState";

export interface DispatchPayload extends Payload {
    op: 0;
}

export interface ChannelCreatePayload extends DispatchPayload {
    d: RawChannel;
    t: "CHANNEL_CREATE";
}

export interface ChannelUpdatePayload extends DispatchPayload {
    d: RawChannel;
    t: "CHANNEL_UPDATE";
}

export interface ChannelDeletePayload extends DispatchPayload {
    d: RawChannel;
    t: "CHANNEL_DELETE";
}

export interface ChannelPinsUpdatePayload extends DispatchPayload {
    d: {
        channel_id: string;
        last_pin_timestamp: string;
    }
    t: "CHANNEL_PINS_UPDATE";
}

export interface GuildCreatePayload extends DispatchPayload {
    d: RawGuild;
    t: "GUILD_CREATE";
}

export interface GuildUpdatePayload extends DispatchPayload {
    d: RawGuild;
    t: "GUILD_UPDATE";
}

export interface GuildDeletePayload extends DispatchPayload {
    d: UnavailableGuild;
    t: "GUILD_DELETE";
}

export interface GuildBanAddPayload extends DispatchPayload {
    d: RawUser & RawGuildSelector;
    t: "GUILD_BAN_ADD";
}

export interface GuildBanRemovePayload extends DispatchPayload {
    d: RawUser & RawGuildSelector;
    t: "GUILD_BAN_REMOVE";
}

export interface GuildEmojisUpdatePayload extends DispatchPayload {
    d: {
        guild_id: string;
        emojis: RawEmoji[];
    };
    t: "GUILD_EMOJIS_UPDATE";
}

export interface GuildIntegrationUpdatePayload extends DispatchPayload {
    d: RawGuildSelector;
    t: "GUILD_INTEGRATIONS_UPDATE";
}

export interface GuildMemberAddPayload extends DispatchPayload {
    d: RawGuildMember & RawGuildSelector;
    t: "GUILD_MEMBER_ADD";
}

export interface GuildMemberRemovePayload extends DispatchPayload {
    d: {
        guild_id: string;
        user: RawUser;
    }
    t: "GUILD_MEMBER_REMOVE";
}

export interface GuildMemberUpdatePayload extends DispatchPayload {
    d: {
        guild_id: string;
        roles: string[];
        user: RawUser;
        nick: string;
    }
    t: "GUILD_MEMBER_UPDATE";
}

export interface GuildMembersChunkPayload extends DispatchPayload {
    d: {
        guild_id: string;
        members: RawGuildMember[];
    }
    t: "GUILD_MEMBERS_CHUNK";
}

export interface GuildRoleCreateOrEditPayload extends DispatchPayload {
    d: {
        guild_id: string;
        role: RawRole;
    }
    t: "GUILD_ROLE_CREATE" | "GUILD_ROLE_DELETE";
}

export interface GuildRoleDeletePayload extends DispatchPayload {
    d: {
        guild_id: string;
        role_id: string;
    }
    t: "GUILD_ROLE_DELETE";
}

export interface MessageCreatePayload extends DispatchPayload {
    d: RawMessage;
    t: "MESSAGE_CREATE";
}

export interface MessageUpdatePayload extends DispatchPayload {
    d: Partial<RawMessage>;
    t: "MESSAGE_UPDATE";
}

export interface MessageDeletePayload extends DispatchPayload {
    d: {
        id: string;
        channel_id: string;
    }
    t: "MESSAGE_DELETE";
}

export interface MessageDeleteBulkPayload extends DispatchPayload {
    d: {
        ids: string[];
        channel_id: string;
    }
}

export interface InnerMessageReaction {
    user_id: string;
    channel_id: string;
    message_id: string;
    emoji: Partial<RawEmoji>;
}

export interface MessageReactionAddPayload extends DispatchPayload {
    d: InnerMessageReaction;
    t: "MESSAGE_REACTION_ADD";
}

export interface MessageReactionRemovePayload extends DispatchPayload {
    d: InnerMessageReaction;
    t: "MESSAGE_REACTION_REMOVE";
}

export interface MessageReactionRemoveAllPayload extends DispatchPayload {
    d: {
        channel_id: string;
        message_id: string;
    };
    t: "MESSAGE_REACTION_REMOVE_ALL";
}

export interface PresenceUpdatePayload extends DispatchPayload {
    d: Presence & RawGuildSelector & {
        user: RawUser;
        roles: string[];
    };
    t: "PRESENCE_UPDATE";
}

export interface TypingStartPayload extends DispatchPayload {
    d: {
        channel_id: string;
        user_id: string;
        timestamp: number;
    };
    t: "TYPING_START";
}

export interface UserUpdatePayload extends DispatchPayload {
    d: RawUser;
    t: "USER_UPDATE";
}

export interface VoiceStateUpdatePayload extends DispatchPayload {
    d: RawVoiceState;
    t: "VOICE_STATE_UPDATE";
}

export interface VoiceServerUpdatePayload extends DispatchPayload {
    d: {
        token: string;
        guild_id: string;
        endpoint: string;
    };
    t: "VOICE_SERVER_UPDATE";
}

export interface WebhooksUpdatePayload extends DispatchPayload {
    d: {
        guild_id: string;
        channel_id: string;
    };
    t: "WEBHOOKS_UPDATE";
}