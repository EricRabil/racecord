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

export async function getGuild(guild: string): Promise<RawGuild> {
    const {body} = await get({url: Endpoints.GUILD(guild)});
    return body;
}

export async function editGuild(guild: string, edits: GuildEdit): Promise<RawGuild> {
    const {body} = await patch({url: Endpoints.GUILD(guild), body: edits});
    return body;
}

export async function createGuild(guild: GuildCreate): Promise<RawGuild> {
    const {body} = await post({url: Endpoints.GUILD_CREATE, body: guild});
    return body;
}

export function deleteGuild(guild: RawGuild): Promise<void> {
    return del({url: Endpoints.GUILD(guild.id)}) as any;
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

export async function createGuildChannel(guild: RawGuild, channel: ChannelCreate): Promise<RawChannel> {
    const {body} = await post({url: Endpoints.GUILD_CHANNELS(guild.id), body: channel});
    return body;
}

export type ChannelEdit = Array<{id: string, position: number}>;

export function editPositions(guild: RawGuild, edits: ChannelEdit): Promise<void> {
    return patch({url: Endpoints.GUILD_CHANNELS(guild.id), body: edits}) as any;
}
