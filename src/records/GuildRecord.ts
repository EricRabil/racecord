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
import { deleteGuild, ChannelCreate, createGuild, createGuildChannel, ChannelEdit, modifyChannelPositions, GuildMembersQuery, getMembers, AddGuildMemberRequest, addMember, EditGuildMemberRequest, editMember, setSelfNickname, getBans, removeBan, RolePosition, modifyRolePositions, getPruneCount, pruneMembers, getVoiceRegions, getInvites, getGuildEmbed, editGuildEmbed, getVanityUrl, GuildEdit, editGuild } from "../util/rest/actions/GuildActions";
import { RawUser, RawBan, RawVoiceRegion, RawIntegration, RawGuildEmbed } from "../types/raw";
import { BanRecord } from "./BanRecord";
import { RoleRecord } from "./RoleRecord";
import { RoleStore } from "../stores/RoleStore";
import { InviteRecord } from "./InviteRecord";
import { mixedMemberInsert, handleGuildMemberAddOrUpdate } from "../stores/GuildMemberStore";

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

    guildOwner: GuildMemberRecord;

    public constructor(data: RawGuild) {
        super();
        const {members} = data;
        this.assign(data, ["members", "channels"]);
        this.readonly("channels", () => Array.from(this.channelsMapped.values()));
        this.readonly("members", () => Array.from(GuildMemberStore.membersFor(this).values()));
        this.readonly("roles", () => Array.from(this.roleMap.values()));
        this.readonly("guildOwner", () => GuildMemberStore.getMember(this.id, this.owner_id));
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

    /**
     * Changes the positions of the channels in this guild
     * @param positions the new channel positions
     */
    public async modifyChannelPositions(positions: ChannelEdit): Promise<void> {
        return modifyChannelPositions(this.id, positions);
    }

    /**
     * Gets a member with the given ID, cached only
     * @param id the ID of the member to get
     */
    public getMember(id: string): GuildMemberRecord | undefined {
        return GuildMemberStore.getMember(this.id, id);
    }

    /**
     * The members to get, mapped and not cached.
     * @param parameters the member query
     */
    public async getMembers(parameters?: GuildMembersQuery): Promise<Map<string, GuildMemberRecord>> {
        return mixedMemberInsert(this.id, await getMembers(this.id, parameters));
    }

    /**
     * Adds a member to this guild
     * @param user the user to add
     * @param oauthToken the oauth token to supply when adding the user
     * @param opts the options when adding the member to the guild
     */
    public async addMember(user: string | RawUser, oauthToken: string, opts: AddGuildMemberRequest): Promise<GuildMemberRecord> {
        return handleGuildMemberAddOrUpdate(await addMember(this.id, typeof user === "string" ? user : user.id, oauthToken, opts)) as GuildMemberRecord;
    }

    /** Gets the bans in this guild, mapped */
    public async getBans(): Promise<Map<string, RawBan>> {
        const bans: Map<string, BanRecord> = new Map();
        for (const ban of await getBans(this.id)) {
            bans.set(ban.user.id, new BanRecord(ban, this));
        }
        return bans;
    }

    /**
     * Unbans a user from the guild
     * @param user the user ID to unban
     */
    public unban(user: string): Promise<void> {
        return removeBan(this.id, user);
    }

    /**
     * A map of role IDs to role records
     */
    public get roleMap(): Map<string, RoleRecord> {
        return RoleStore.getOrCreateSection(this.id);
    }

    /**
     * Change the role hoist
     * @param positions the new positions
     */
    public modifyRolePositions(positions: RolePosition[]): Promise<void> {
        return modifyRolePositions(this.id, positions) as Promise<any>;
    }

    /**
     * Gets the predicted member prune count for the given number of days of inactivity
     * @param inactivityDays the number of days of inactivity
     */
    public getPruneCount(inactivityDays: number = 1): Promise<number> {
        return getPruneCount(this.id, inactivityDays);
    }

    /**
     * Kicks members that have been inactive for the given number of days
     * @param inactivityDays the number of days of inactivity
     */
    public pruneMembers(inactivityDays: number = 1): Promise<number> {
        return pruneMembers(this.id, inactivityDays);
    }

    /** Gets the voice regions for this guild */
    public getVoiceRegions(): Promise<RawVoiceRegion[]> {
        return getVoiceRegions(this.id);
    }

    /** Gets the invites for this guild */
    public async getInvites(): Promise<InviteRecord[]> {
        const invites: InviteRecord[] = [];
        for (const invite of await getInvites(this.id)) {
            invites.push(new InviteRecord(invite));
        }
        return invites;
    }

    /** Gets the embed for this guild */
    public getEmbed(): Promise<RawGuildEmbed> {
        return getGuildEmbed(this.id);
    }

    /**
     * Modifies the embed for this guild
     * @param embed the embed edit
     */
    public editEmbed(embed: RawGuildEmbed): Promise<RawGuildEmbed> {
        return editGuildEmbed(this.id, embed);
    }

    /** Gets the vanity URL for this guild */
    public getVanityURL(): Promise<string> {
        return getVanityUrl(this.id);
    }

    /**
     * Edit this guild
     * @param edits the guild edits to apply
     */
    public edit(edits: GuildEdit): Promise<void> {
        return editGuild(this.id, edits) as any;
    }

    /**
     * Sets the name of this guild
     * @param name the new name
     */
    public setName(name: string): Promise<void> {
        return this.edit({name});
    }

    /**
     * Sets the region of this guild
     * @param region the new region
     */
    public setRegion(region: string): Promise<void> {
        return this.edit({region});
    }

    /**
     * Sets the verification level of this guild
     * @param verification_level the verification level
     */
    public setVertificationLevel(verification_level: number): Promise<void> {
        return this.edit({verification_level});
    }

    /**
     * Sets the default message notifications level
     * @param default_message_notifications the new notifications level
     */
    public setDefaultMessageNotifications(default_message_notifications: number): Promise<void> {
        return this.edit({default_message_notifications});
    }

    /**
     * Sets the content filtering settings
     * @param explicit_content_filter the new content filter level
     */
    public setExplicitContentFilter(explicit_content_filter: number): Promise<void> {
        return this.edit({explicit_content_filter});
    }

    /**
     * Sets the AFK channel
     * @param afk_channel_id the AFK channel
     */
    public setAFKChannelID(afk_channel_id: string): Promise<void> {
        return this.edit({afk_channel_id});
    }

    /**
     * Sets the AFK timeout in milliseconds
     * @param afk_timeout the timeout
     */
    public setAFKTimeout(afk_timeout: number): Promise<void> {
        return this.edit({afk_timeout});
    }

    /**
     * Sets the Base64 icon of this guild
     * @param icon the new icon
     */
    public setIcon(icon: string): Promise<void> {
        return this.edit({icon});
    }

    /**
     * Sets the owner of this guild
     * @param owner_id the new owner ID
     */
    public setOwner(owner_id: string): Promise<void> {
        return this.edit({owner_id});
    }

    /**
     * Sets the splash text for this guild
     * @param splash the splash text
     */
    public setSplash(splash: string): Promise<void> {
        return this.edit({splash});
    }

    /**
     * Sets the channel for system notifications
     * @param system_channel_id the new notification channel
     */
    public setSystemChannelID(system_channel_id: string): Promise<void> {
        return this.edit({system_channel_id});
    }

}