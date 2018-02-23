import { RawGuild, RawEmoji } from "../../../types/raw";
import { get, post, patch, del } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { EmojiRecord } from "../../../records/EmojiRecord";

export async function listEmojis(guild: RawGuild): Promise<Map<string, EmojiRecord>> {
    const {body} = await get({url: Endpoints.GUILD_EMOJIS(guild)});
    const emojis: Map<string, EmojiRecord> = new Map();
    for (const emoji of body) {
        emojis.set(emoji.id, new EmojiRecord(emoji));
    }
    return emojis;
}

export async function getEmoji(guild: RawGuild, emoji: RawEmoji): Promise<EmojiRecord> {
    const {body} = await get({url: Endpoints.GUILD_EMOJIS(guild, emoji)});
    return new EmojiRecord(body, guild.id);
}

export interface EmojiCreate {
    name: string;
    image: string;
    roles: string[];
}

export async function createEmoji(guild: RawGuild, emoji: EmojiCreate): Promise<EmojiRecord> {
    const {body} = await post({url: Endpoints.GUILD_EMOJIS(guild), body: emoji});
    return new EmojiRecord(body, guild.id);
}

export interface EmojiEdit {
    name: string;
    roles: string[];
}

export async function editEmoji(guild: RawGuild, emoji: EmojiRecord, edits: EmojiEdit): Promise<RawEmoji> {
    const {body} = await patch({url: Endpoints.GUILD_EMOJIS(guild, emoji), body: edits});
    emoji.merge(body);
    return body;
}

export function deleteEmoji(guild: RawGuild, emoji: RawEmoji): Promise<void> {
    return del({url: Endpoints.GUILD_EMOJIS(guild, emoji)}) as any;
}