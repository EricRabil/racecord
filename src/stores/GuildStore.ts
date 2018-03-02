import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes, Action } from "../types/structures/action";
import { GuildRecord } from "../records/GuildRecord";
import { GuildCreatePayload, GuildDeletePayload, GuildUpdatePayload } from "../util/gateway/GatewayEvents";
import { Analytics } from "../util/Analytics";
import { RawGuild } from "../types/raw/RawGuild";
import { PublicDispatcher } from "../util/Dispatcher";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Pending } from "../helpers/Pending";

const guilds: Map<string, GuildRecord> = new Map();
const waiter: Pending<GuildRecord> = new Pending();

export const GuildStore = new class implements Store<GuildRecord> {
    /**
     * A map of all guilds
     */
    public get guilds(): Map<string, GuildRecord> {
        return guilds;
    }

    public hasGuild(guild: string) {
        return guilds.has(guild);
    }

    public async findOrCreate(id: string): Promise<GuildRecord | undefined> {
        let guild: RawGuild | GuildRecord | undefined = guilds.get(id);
        if (guild) {
            return guild as GuildRecord;
        } else if (guild = await getEntity<RawGuild>(Endpoints.GUILD(id))) {
            return handleGuildCreate({d: guild} as any, false);
        }
    }

    public once(id: string): Promise<GuildRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }
}

function handleGuildCreate(action: GuildCreatePayload, dispatch: boolean = true): GuildRecord {
    const guildData = action.d;
    const record = new GuildRecord(guildData);
    guilds.set(record.id, record);
    if (dispatch) {
        PublicDispatcher.dispatch({type: ActionTypes.GUILD_CREATE, data: record});
    }
    waiter.emit(record.id, record);
    return record;
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