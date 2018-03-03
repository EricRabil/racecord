import { RawGuild, RawEmoji } from "../../../types/raw";
import { get, post, patch, del } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";

export async function listEmojis(guild: RawGuild): Promise<Map<string, RawEmoji>> {
    const {body} = await get({url: Endpoints.GUILD_EMOJIS(guild.id)});
    const emojis: Map<string, RawEmoji> = new Map();
    for (const emoji of body) {
        emojis.set(emoji.id, emoji);
    }
    return emojis;
}

export function getEmoji(guild: RawGuild, emoji: RawEmoji): Promise<RawEmoji> {
    return get({url: Endpoints.GUILD_EMOJIS(guild.id, emoji.id as string)}).then(res => res.body);
}

export interface EmojiCreate {
    name: string;
    image: string;
    roles: string[];
}

export async function createEmoji(guild: RawGuild, emoji: EmojiCreate): Promise<RawEmoji> {
    return post({url: Endpoints.GUILD_EMOJIS(guild.id), body: emoji}).then(res => res.body);
}

export interface EmojiEdit {
    name: string;
    roles: string[];
}

export async function editEmoji(guild: RawGuild, emoji: RawEmoji, edits: EmojiEdit): Promise<RawEmoji> {
    return patch({url: Endpoints.GUILD_EMOJIS(guild.id, emoji.id as string), body: edits}).then(res => res.body);
}

export function deleteEmoji(guild: RawGuild, emoji: RawEmoji): Promise<void> {
    return del({url: Endpoints.GUILD_EMOJIS(guild.id, emoji.id as string)}) as any;
}