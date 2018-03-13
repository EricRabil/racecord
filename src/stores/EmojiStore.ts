import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { GuildEmojisUpdatePayload } from "../util/gateway/GatewayEvents";
import { EmojiRecord } from "../records/EmojiRecord";
import { RawEmoji } from "../types/raw";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Pending } from "../helpers/Pending";
import { PublicDispatcher } from "../util/Dispatcher";
import { GuildStore } from ".";
import { GuildRecord } from "../records";

const guildEmojis: Map<string, Map<string, EmojiRecord>> = new Map();
const waiter: Pending<EmojiRecord> = new Pending();

export class EmojiStoreImpl implements Store<EmojiRecord> {

    /**
     * Returns all emojis for the given guild
     * @param guild the guild ID
     */
    public getEmojis(guild: string): Map<string, EmojiRecord> {
        return guildEmojis.get(guild) as Map<string, EmojiRecord>;
    }

    /**
     * Returns an emoji within a given guild
     * @param guild the guild ID
     * @param emoji the emoji ID
     */
    public getEmoji(guild: string, emoji: string): EmojiRecord | undefined {
        const emojiMap = guildEmojis.get(guild);
        return emojiMap && emojiMap.get(emoji);
    }

    /**
     * Locates an emoji without the guild ID (possible performance hit when there's a lot of guilds/emojis)
     * @param id the guild ID
     */
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

export const EmojiStore = new EmojiStoreImpl();

async function emojiIntake(guildID: string, emojis: RawEmoji[]) {
    const emojiMap: Map<string, EmojiRecord> = new Map();
    for (const emoji of emojis) {
        const emojiRecord = new EmojiRecord(emoji, guildID);
        waiter.emit(emojiRecord.id, emojiRecord);
        emojiMap.set(emoji.id as string, emojiRecord);
    }
    guildEmojis.set(guildID, emojiMap);
    PublicDispatcher.dispatch({
        type: "GUILD_EMOJIS_UPDATE",
        data: (await GuildStore.findOrCreate(guildID)) as GuildRecord
    });
}

StoreManager.register(EmojiStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_EMOJIS_UPDATE:
            const updatePayload = action.payload as GuildEmojisUpdatePayload;
            emojiIntake(updatePayload.d.guild_id, updatePayload.d.emojis);
            break;
    }
});