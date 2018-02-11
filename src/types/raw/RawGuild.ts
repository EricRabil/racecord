import { RawRole } from "./RawRole";
import { RawGuildMember } from "./RawGuildMember";
import { RawChannel } from "./RawChannel";
import { Presence } from "../discord/user/presence";
import { RawEmoji } from "./RawEmoji";

export interface RawGuild {
    id: string;
    name: string;
    icon: string | null;
    splash: string | null;
    owner?: boolean;
    owner_id: string;
    permissions?: number;
    region: string;
    afk_channel_id: string;
    afk_timeout: number;
    embed_enabled?: boolean;
    embed_channel_id?: boolean;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: RawRole[];
    emojis: RawEmoji[];
    features: string[];
    mfa_level: number;
    application_id: string | null;
    widget_enabled?: boolean;
    widget_channel_id?: string;
    system_channel_id?: string;
    joined_at?: string;
    large?: boolean;
    unavailable?: boolean;
    member_count?: number;
    voice_states?: number;
    members?: RawGuildMember[];
    channels?: RawChannel[];
    presences?: Presence[];
}

export interface RawGuildSelector {
    guild_id: string;
}