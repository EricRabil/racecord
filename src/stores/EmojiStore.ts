import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { GuildEmojisUpdatePayload } from "../util/gateway/GatewayEvents";
import { EmojiRecord } from "../records/EmojiRecord";
import { RawEmoji } from "../types/raw";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Pending } from "../helpers/Pending";

const guildEmojis: Map<string, Map<string, EmojiRecord>> = new Map();
const waiter: Pending<EmojiRecord> = new Pending();

export const EmojiStore = new class implements Store<EmojiRecord> {

    public getEmojis(guild: string): Map<string, EmojiRecord> {
        return guildEmojis.get(guild) as Map<string, EmojiRecord>;
    }

    public getEmoji(guild: string, emoji: string): EmojiRecord | undefined {
        const emojiMap = guildEmojis.get(guild);
        return emojiMap && emojiMap.get(emoji);
    }

    public async locateEmoji(id: string): Promise<EmojiRecord | undefined> {
        for (const [, guildStore] of guildEmojis) {
            for (const [, emoji] of guildStore) {
                if (emoji.id === id) {
                    return emoji;
                }
            }
        }
    }

    public async findOrCreate(id: string, guild?: string): Promise<EmojiRecord | undefined> {
        let emoji: RawEmoji | EmojiRecord | undefined = guild ? this.getEmoji(guild, id) : await this.locateEmoji(id);
        if (emoji) {
            return emoji as EmojiRecord;
        } else {
            if (!guild) {
                return;
            }
            if (emoji = await getEntity<RawEmoji>(Endpoints.GUILD_EMOJIS(guild, id))) {
                emoji = new EmojiRecord(emoji);
                emojiIntake(guild, [emoji]);
                return emoji as EmojiRecord;
            }
        }
        return undefined;
    }

    public once(id: string): Promise<EmojiRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }

}

async function emojiIntake(guildID: string, emojis: RawEmoji[]) {
    const emojiMap: Map<string, EmojiRecord> = new Map();
    for (const emoji of emojis) {
        const emojiRecord = new EmojiRecord(emoji, guildID);
        waiter.emit(emojiRecord.id, emojiRecord);
        emojiMap.set(emoji.id as string, emojiRecord);
    }
    guildEmojis.set(guildID, emojiMap);
}

StoreManager.register(EmojiStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_EMOJIS_UPDATE:
            const updatePayload = action.payload as GuildEmojisUpdatePayload;
            break;
    }
});