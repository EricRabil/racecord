import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes, Action } from "../types/structures/action";
import { GuildRecord } from "../records/GuildRecord";
import { GuildCreatePayload, GuildDeletePayload, GuildUpdatePayload } from "../util/gateway/GatewayEvents";
import { Analytics } from "../util/Analytics";
import { RawGuild } from "../types/raw/RawGuild";
import { PublicDispatcher } from "../util/Dispatcher";

const guilds: Map<string, GuildRecord> = new Map();

export const GuildStore = new class implements Store {
    /**
     * A map of all guilds
     */
    public get guilds(): Map<string, GuildRecord> {
        return guilds;
    }

    public hasGuild(guild: string) {
        return guilds.has(guild);
    }
}

function handleGuildCreate(action: GuildCreatePayload) {
    const guildData = action.d;
    const record = new GuildRecord(guildData);
    guilds.set(record.id, record);
    PublicDispatcher.dispatch({type: ActionTypes.GUILD_CREATE, data: record});
}

function handleGuildDelete(action: GuildDeletePayload) {
    const record = guilds.get(action.d.id);
    if (record) {
        record.unavailable = action.d.unavailable;
    }
    guilds.delete(action.d.id);
    PublicDispatcher.dispatch({type: ActionTypes.GUILD_DELETE, data: record});
}

function handleGuildUpdate(action: GuildUpdatePayload) {
    const record = guilds.get(action.d.id);
    if (!record) {
        return;
    }
    record.merge(action.d);
    PublicDispatcher.dispatch({type: ActionTypes.GUILD_UPDATE, data: record});
}

StoreManager.register(GuildStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_CREATE:
            handleGuildCreate(action.payload as any);
            break;
        case ActionTypes.GUILD_DELETE:
            handleGuildDelete(action.payload as any);
            break;
        case ActionTypes.GUILD_UPDATE:
            handleGuildUpdate(action.payload as any);
            break;
    }
});