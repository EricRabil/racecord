import { RawRole, RawGuild } from "../../../types/raw";
import { GuildRecord, ChannelRecord } from "../../../records";
import { get, patch, post, del } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { Overwrite } from "../../../types/discord/channel/overwrite";

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

export async function getGuild(guild: string): Promise<GuildRecord> {
    const {body} = await get({url: Endpoints.GUILD({id: guild})});
    return new GuildRecord(body);
}

export async function editGuild(guild: GuildRecord, edits: GuildEdit): Promise<GuildRecord> {
    const {body} = await patch({url: Endpoints.GUILD(guild), body: edits});
    guild.merge(body);
    return guild;
}

export async function createGuild(guild: GuildCreate): Promise<GuildRecord> {
    const {body} = await post({url: Endpoints.GUILD_CREATE, body: guild});
    return new GuildRecord(body);
}

export function deleteGuild(guild: RawGuild): Promise<void> {
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

export async function createGuildChannel(guild: RawGuild, channel: ChannelCreate): Promise<ChannelRecord> {
    const {body} = await post({url: Endpoints.GUILD_CHANNELS(guild), body: channel});
    return new ChannelRecord(body);
}

export type ChannelEdit = Array<{id: string, position: number}>;

export function editPositions(guild: RawGuild, edits: ChannelEdit): Promise<void> {
    return patch({url: Endpoints.GUILD_CHANNELS(guild), body: edits}) as any;
}
