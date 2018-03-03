import { Record } from "../classes/Record";
import { RawGuild } from "../types/raw/RawGuild";
import { RawRole } from "../types/raw/RawRole";
import { RawEmoji } from "../types/raw/RawEmoji";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { RawChannel } from "../types/raw/RawChannel";
import { Presence } from "../types/discord/user/presence";
import { GuildMemberRecord } from "./GuildMemberRecord";
import { GuildMemberStore, mixedMemberInsert, handleGuildMemberAddOrUpdate } from "../stores/index";
import { ChannelRecord } from "./ChannelRecord";
import { ChannelStore } from "../stores/ChannelStore";
import { TextChannel } from "../classes/channel/TextChannel";
import { VoiceChannel } from "../classes/channel/VoiceChannel";
import { ChannelCategory } from "../classes/channel/ChannelCategory";
import { ChannelTypes } from "../util/Constants";
import { deleteGuild, ChannelCreate, createGuild, createGuildChannel, ChannelEdit, modifyChannelPositions, GuildMembersQuery, getMembers, AddGuildMemberRequest, addMember, EditGuildMemberRequest, editMember, setSelfNickname, getBans, removeBan, RolePosition, modifyRolePositions, getPruneCount, pruneMembers, getVoiceRegions, getInvites, getGuildEmbed, editGuildEmbed, getVanityUrl } from "../util/rest/actions/GuildActions";
import { RawUser, RawBan, RawVoiceRegion, RawIntegration, RawGuildEmbed } from "../types/raw";
import { BanRecord } from "./BanRecord";
import { RoleRecord } from "./RoleRecord";
import { RoleStore } from "../stores/RoleStore";
import { InviteRecord } from "./InviteRecord";

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
    roles: RoleRecord[];
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
        this.readonly("roles", () => Array.from(this.roleMap.values()));
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

    /**
     * Deletes the guild
    */
    public deleteGuild(): Promise<void> {
        return deleteGuild(this.id);
    }

    /**
     * Creates a channel for the given guild
     * @param channel the channel create request
     */
    public async createChannel(channel: ChannelCreate): Promise<ChannelRecord> {
        const {id} = await createGuildChannel(this.id, channel);
        return await ChannelStore.once(id);
    }

    public async modifyChannelPositions(positions: ChannelEdit): Promise<void> {
        return modifyChannelPositions(this.id, positions);
    }

    public getMember(id: string): Promise<GuildMemberRecord | undefined> {
        return GuildMemberStore.findOrCreate(id, this.id);
    }

    public async getMembers(parameters?: GuildMembersQuery): Promise<Map<string, GuildMemberRecord>> {
        return mixedMemberInsert(this.id, await getMembers(this.id, parameters));
    }

    public async addMember(user: string | RawUser, oauthToken: string, opts: AddGuildMemberRequest): Promise<GuildMemberRecord> {
        return handleGuildMemberAddOrUpdate(await addMember(this.id, typeof user === "string" ? user : user.id, oauthToken, opts)) as GuildMemberRecord;
    }

    public async getBans(): Promise<Map<string, RawBan>> {
        const bans: Map<string, BanRecord> = new Map();
        for (const ban of await getBans(this.id)) {
            bans.set(ban.user.id, new BanRecord(ban, this));
        }
        return bans;
    }

    public unban(user: string): Promise<void> {
        return removeBan(this.id, user);
    }

    public get roleMap(): Map<string, RoleRecord> {
        return RoleStore.getOrCreateSection(this.id);
    }

    public modifyRolePositions(positions: RolePosition[]): Promise<void> {
        return modifyRolePositions(this.id, positions) as Promise<any>;
    }

    public getPruneCount(inactivityDays: number = 1): Promise<number> {
        return getPruneCount(this.id, inactivityDays);
    }

    public pruneMembers(inactivityDays: number = 1): Promise<number> {
        return pruneMembers(this.id, inactivityDays);
    }

    public getVoiceRegions(): Promise<RawVoiceRegion[]> {
        return getVoiceRegions(this.id);
    }

    public async getInvites(): Promise<InviteRecord[]> {
        const invites: InviteRecord[] = [];
        for (const invite of await getInvites(this.id)) {
            invites.push(new InviteRecord(invite));
        }
        return invites;
    }

    public getEmbed(): Promise<RawGuildEmbed> {
        return getGuildEmbed(this.id);
    }

    public editEmbed(embed: RawGuildEmbed): Promise<RawGuildEmbed> {
        return editGuildEmbed(this.id, embed);
    }

    public getVanityURL(): Promise<string> {
        return getVanityUrl(this.id);
    }

}