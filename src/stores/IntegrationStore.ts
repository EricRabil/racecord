import { Store } from "../types/structures/store";
import { IntegrationRecord } from "../records/IntegrationRecord";
import { StoreManager } from "../util/StoreManager";
import { Pending } from "../helpers/Pending";
import { GuildIntegrationUpdatePayload } from "../util/gateway/GatewayEvents";
import { RawIntegration } from "../types/raw";
import { PublicDispatcher } from "../util/Dispatcher";
import { ActionType, ActionTypes } from "../types/structures/action";

const integrations: Map<string, Map<string, IntegrationRecord>> = new Map();
const waiter: Pending<IntegrationRecord> = new Pending();

export const IntegrationStore = new class IntegrationStore implements Store<IntegrationRecord> {
    findOrCreate(id: string): Promise<IntegrationRecord | undefined> {
        throw new Error("Method not implemented.");
    }
    once(id: string): Promise<IntegrationRecord> {
        throw new Error("Method not implemented.");
    }
}

function getOrCreateSection(id: string): Map<string, IntegrationRecord> {
    return integrations.get(id) || integrations.set(id, new Map()).get(id) as Map<string, IntegrationRecord>;
}

export function handleIntegrationAddOrUpdate(integration: RawIntegration, guild: string, type: ActionType, dispatch: boolean = true): IntegrationRecord {
    const section = getOrCreateSection(guild);
    let record = section.get(integration.id);
    if (record) {
        record.merge(integration);
    } else {
        record = new IntegrationRecord(integration);
        section.set(integration.id, record);
    }
    if (dispatch) {
        PublicDispatcher.dispatch({type, data: record});
    }
    return record;
}
