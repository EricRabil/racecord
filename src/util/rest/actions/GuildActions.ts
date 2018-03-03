import { RawRole, RawGuild, RawChannel, RawGuildMember, RawBan, RawVoiceRegion, RawIntegration, RawGuildEmbed } from "../../../types/raw";
import { get, patch, post, del, put } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { Overwrite } from "../../../types/discord/channel/overwrite";
import { RawInvite } from "../../../types/raw/RawInvite";

export interface GuildCreate {
    name: string;
    region?: string;
    icon?: string;
    verification_level?: number;
    default_message_notifications?: number;
    explicit_content_filter?: number;
    roles?: RawRole[];
    channels?: Array<Partial<RawRole>>;
}

export interface GuildEdit {
    name?: string;
    region?: string;
    verification_level?: number;
    default_message_notifications?: number;
    explicit_content_filter?: number;
    afk_channel_id?: string;
    afk_timeout?: number;
    icon?: string;
    owner_id?: string;
    splash?: string;
    system_channel_id?: string;
}

export function getGuild(guild: string): Promise<RawGuild> {
    return get({url: Endpoints.GUILD(guild)}).then(res => res.body);
}

export function editGuild(guild: string, edits: GuildEdit): Promise<RawGuild> {
    return patch({url: Endpoints.GUILD(guild), body: edits}).then(res => res.body);
}

export function createGuild(guild: GuildCreate): Promise<RawGuild> {
    return post({url: Endpoints.GUILD_CREATE, body: guild}).then(res => res.body);
}

export function deleteGuild(guild: string): Promise<void> {
    return del({url: Endpoints.GUILD(guild)}) as any;
}

export interface ChannelCreate {
    name: string;
    type?: number;
    bitrate?: number;
    user_limit?: number;
    permission_overwrites?: Overwrite[];
    parent_id?: string;
    nsfw?: boolean;
}

export function createGuildChannel(guild: string, channel: ChannelCreate): Promise<RawChannel> {
    return post({url: Endpoints.GUILD_CHANNELS(guild), body: channel}).then(res => res.body);
}

export type ChannelEdit = Array<{id: string, position: number}>;

export function modifyChannelPositions(guild: string, edits: ChannelEdit): Promise<void> {
    return patch({url: Endpoints.GUILD_CHANNELS(guild), body: edits}) as any;
}

export function getMember(guild: string, member: string): Promise<RawGuildMember> {
    return get({url: Endpoints.GUILD_MEMBER(guild, member)}).then(res => res.body);
}

export interface GuildMembersQuery {
    limit?: number;
    after?: string;
}

export async function getMembers(guild: string, parameters?: GuildMembersQuery): Promise<RawGuildMember[]> {
    return get({url: Endpoints.GUILD_MEMBERS(guild), query: parameters}).then(res => res.body);
}

export interface AddGuildMemberRequest {
    nick?: string;
    roles?: string[];
    mute?: boolean;
    deaf?: boolean;
}

export function addMember(guild: string, user: string, oauth: string, opts: AddGuildMemberRequest): Promise<RawGuildMember> {
    return put({url: Endpoints.GUILD_MEMBER(guild, user), body: {
        access_token: oauth,
        ...opts
    }}).then(res => res.body);
}

export interface EditGuildMemberRequest extends AddGuildMemberRequest {
    channel_id?: string;
}

// member
export function editMember(guild: string, member: string, patches: EditGuildMemberRequest): Promise<void> {
    return patch({url: Endpoints.GUILD_MEMBER(guild, member), body: patches}) as any;
}

// selfMember
export function setSelfNickname(guild: string, nickname: string): Promise<string> {
    return patch({url: Endpoints.SET_SELF_NICKNAME(guild), body: {nick: nickname}}).then(res => res.body.nick);
}

// member
export function addRoleToMember(guild: string, user: string, role: string): Promise<void> {
    return put({url: Endpoints.MEMBER_ROLE(guild, user, role)}) as any;
}

// member
export function removeRoleFromMember(guild: string, user: string, role: string): Promise<void> {
    return del({url: Endpoints.MEMBER_ROLE(guild, user, role)}) as any;
}

// member
export function kickMember(guild: string, user: string): Promise<void> {
    return del({url: Endpoints.GUILD_MEMBER(guild, user)}) as any;
}

export function getBans(guild: string): Promise<RawBan[]> {
    return get({url: Endpoints.GUILD_BANS(guild)}).then(res => res.body);
}

export interface BanOptions {
    deleteMessageDays?: number;
    reason?: string;
}

// member
export function banUser(guild: string, user: string, opts?: BanOptions): Promise<void> {
    const apiOpts = {
        "delete-message-days": opts && opts.deleteMessageDays || 0,
        reason: opts && opts.reason || ""
    }
    return put({url: Endpoints.GUILD_BAN(guild, user), body: apiOpts}) as any;
}

export function removeBan(guild: string, user: string): Promise<void> {
    return del({url: Endpoints.GUILD_BAN(guild, user)}) as any;
}

export function getRoles(guild: string): Promise<RawRole[]> {
    return get({url: Endpoints.GUILD_ROLES(guild)}).then(res => res.body);
}

export interface RolePosition {
    id: string;
    position: number;
}

export function modifyRolePositions(guild: string, positions: RolePosition[]): Promise<RawRole[]> {
    return patch({url: Endpoints.GUILD_ROLES(guild), body: positions}).then(res => res.body);
}

export interface RoleEdit {
    name?: string;
    permissions?: number;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
}

export function editRole(guild: string, role: string, edits: RoleEdit): Promise<RawRole> {
    return patch({url: Endpoints.GUILD_ROLE(guild, role), body: edits}).then(res => res.body);
}

export function deleteRole(guild: string, role: string): Promise<void> {
    return del({url: Endpoints.GUILD_ROLE(guild, role)}) as any;
}

export function getPruneCount(guild: string, days: number = 1): Promise<number> {
    return get({url: Endpoints.GUILD_PRUNE(guild), query: {days}}).then(res => res.body.pruned);
}

export function pruneMembers(guild: string, days: number = 1): Promise<number> {
    return post({url: Endpoints.GUILD_PRUNE(guild), query: {days}}).then(res => res.body.pruned);
}

export function getVoiceRegions(guild: string): Promise<RawVoiceRegion[]> {
    return get({url: Endpoints.GUILD_REGIONS(guild)}).then(res => res.body);
}

export function getInvites(guild: string): Promise<RawInvite[]> {
    return get({url: Endpoints.GUILD_INVITES(guild)}).then(res => res.body);
}

export function getIntegrations(guild: string): Promise<RawIntegration[]> {
    return get({url: Endpoints.GUILD_INTEGRATIONS(guild)}).then(res => res.body);
}

export function createIntegration(guild: string, id: string, type: number): Promise<void> {
    return post({url: Endpoints.GUILD_INTEGRATIONS(guild), body: {type, id}}) as any;
}

export interface IntegrationGuildEdit {
    expire_behavior: number;
    expire_grace_period: number;
    enable_emoticons: number;
}

export function editIntegration(guild: string, id: string, opts: IntegrationGuildEdit): Promise<void> {
    return patch({url: Endpoints.GUILD_INTEGRATION(guild, id), body: opts}) as any;
}

export function deleteIntegration(guild: string, id: string): Promise<void> {
    return del({url: Endpoints.GUILD_INTEGRATION(guild, id)}) as any;
}

export function syncIntegration(guild: string, id: string): Promise<void> {
    return post({url: Endpoints.GUILD_SYNC_INTEGRATION(guild, id)}) as any;
}

export function getGuildEmbed(guild: string): Promise<RawGuildEmbed> {
    return get({url: Endpoints.GUILD_EMBED(guild)}).then(res => res.body);
}

export function editGuildEmbed(guild: string, embed: RawGuildEmbed): Promise<RawGuildEmbed> {
    return patch({url: Endpoints.GUILD_EMBED(guild), body: embed}).then(res => res.body);
}

export function getVanityUrl(guild: string): Promise<string> {
    return get({url: Endpoints.GUILD_VANITY_URL(guild)}).then(res => res.body.code);
}