import { Record } from "../classes/Record";
import { RawGuild } from "../types/raw/RawGuild";
import { RawRole } from "../types/raw/RawRole";
import { RawEmoji } from "../types/raw/RawEmoji";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { RawChannel } from "../types/raw/RawChannel";
import { Presence } from "../types/discord/user/presence";
import { GuildMemberRecord } from "./GuildMemberRecord";
import { GuildMemberStore } from "../stores/index";
import { ChannelRecord } from "./ChannelRecord";
import { ChannelStore } from "../stores/ChannelStore";
import { TextChannel } from "../classes/channel/TextChannel";
import { VoiceChannel } from "../classes/channel/VoiceChannel";
import { ChannelCategory } from "../classes/channel/ChannelCategory";
import { ChannelTypes } from "../util/Constants";

export class GuildRecord extends Record implements RawGuild {

    id: string;
    name: string;
    icon: string | null;
    splash: string | null;
    owner: boolean;
    owner_id: string;
    permissions: number;
    region: string;
    afk_channel_id: string;
    afk_timeout: number;
    embed_enabled: boolean;
    embed_channel_id: boolean;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: RawRole[];
    emojis: RawEmoji[];
    features: string[];
    mfa_level: number;
    application_id: string | null;
    widget_enabled: boolean;
    widget_channel_id: string;
    system_channel_id: string;
    joined_at: string;
    large: boolean;
    unavailable: boolean;
    member_count: number;
    voice_states: number;
    presences: Presence[];
    channels: ChannelRecord[];
    members: GuildMemberRecord[];

    public constructor(data: RawGuild) {
        super();
        const {members} = data;
        this.assign(data, ["members", "channels"]);
        this.readonly("channels", () => Array.from(this.channelsMapped.values()));
        this.readonly("members", () => Array.from(GuildMemberStore.membersFor(this).values()));
    }

    /**
     * A map of member IDs to member records
     */
    public get membersCollection(): Map<string, GuildMemberRecord> {
        return GuildMemberStore.membersFor(this);
    }

    /**
     * A map of channel IDs to channel records
     */
    public get channelsMapped(): Map<string, ChannelRecord> {
        return ChannelStore.getChannelsForGuild(this);
    }

    /**
     * A map of channel IDs to text channel records
     */
    public get textChannels(): Map<string, TextChannel> {
        return ChannelStore.getTypedChannelsForGuild(this, ChannelTypes.GUILD_TEXT) as any;
    }

    /**
     * A map of channel IDs to voice channel records
     */
    public get voiceChannels(): Map<string, VoiceChannel> {
        return ChannelStore.getTypedChannelsForGuild(this, ChannelTypes.GUILD_VOICE) as any;
    }

    /**
     * A map of channel IDs to category records
     */
    public get channelCategories(): Map<string, ChannelCategory> {
        return ChannelStore.getTypedChannelsForGuild(this, ChannelTypes.CATEGORY) as any;
    }
}