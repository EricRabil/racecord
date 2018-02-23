import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { GuildEmojisUpdatePayload } from "../util/gateway/GatewayEvents";
import { EmojiRecord } from "../records/EmojiRecord";
import { RawEmoji } from "../types/raw";

const guildEmojis: Map<string, Map<string, EmojiRecord>> = new Map();

export const EmojiStore = new class implements Store {
    public getEmojis(guild: string): Map<string, EmojiRecord> {
        return guildEmojis.get(guild) as Map<string, EmojiRecord>;
    }

    public getEmoji(guild: string, emoji: string): EmojiRecord | undefined {
        const emojiMap = guildEmojis.get(guild);
        return emojiMap && emojiMap.get(emoji);
    }
}

async function emojiIntake(guildID: string, emojis: RawEmoji[]) {
    const emojiMap: Map<string, EmojiRecord> = new Map();
    for (const emoji of emojis) {
        emojiMap.set(emoji.id as string, new EmojiRecord(emoji, guildID));
    }
    guildEmojis.set(guildID, emojiMap);
}

StoreManager.register(EmojiStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_EMOJIS_UPDATE:
            const updatePayload = action.payload as GuildEmojisUpdatePayload;
            
    }
});