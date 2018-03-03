import { RoleRecord } from "../records/RoleRecord";
import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { GuildRoleCreateOrEditPayload, Payload, GuildRoleDeletePayload } from "../util/gateway/GatewayEvents";
import { Pending } from "../helpers/Pending";
import { ActionType, ActionTypes } from "../types/structures/action";
import { PublicDispatcher } from "../util/Dispatcher";
import { RawRole } from "../types/raw";
import { GuildStore } from ".";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";

const roles: Map<string, Map<string, RoleRecord>> = new Map();
const waiter: Pending<RoleRecord> = new Pending();

export const RoleStore = new class implements Store<RoleRecord> {

    public getOrCreateSection = getOrCreateSection;

    public async findOrCreate(id: string, guild?: string): Promise<RoleRecord | undefined> {
        let role: RawRole | RoleRecord | undefined = guild && getOrCreateSection(guild as string).get(id) || await recursiveRoleLookup(id);
        if (role) {
            return role as RoleRecord;
        } else if (guild && (role = await getEntity<RawRole>(Endpoints.GUILD_ROLE(guild as string, id)))) {
            return handleRoleCreateOrUpdate({d: {...role, guild_id: guild}} as any, undefined, false);
        }
    }

    public once(id: string): Promise<RoleRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }
}

export async function recursiveRoleLookup(roleID: string): Promise<RoleRecord | undefined> {
    for (const [,roleSection] of roles) {
        for (const [,role] of roleSection) {
            if (role.id === roleID) {
                return role;
            }
        }
    }
}

function getOrCreateSection(id: string): Map<string, RoleRecord> {
    return roles.get(id) || roles.set(id, new Map()).get(id) as Map<string, RoleRecord>;
}

function handleRoleCreateOrUpdate(action: GuildRoleCreateOrEditPayload, type?: ActionType, dispatch: boolean = true): RoleRecord {
    const role = action.d;
    const section = getOrCreateSection(role.guild_id);
    let roleRecord = section.get(role.role.id);
    if (roleRecord) {
        roleRecord.merge(action.d.role);
    } else {
        roleRecord = new RoleRecord(action.d.role, role.guild_id);
    }
    if (type && dispatch) {
        PublicDispatcher.dispatch({type, data: roleRecord});
    }
    if (type === ActionTypes.GUILD_ROLE_CREATE) {
        waiter.emit(roleRecord.id, roleRecord);
    }
    return roleRecord;
}

function handleRoleDelete(action: GuildRoleDeletePayload, dispatch: boolean = true) {
    const {role_id, guild_id} = action.d;
    const section = getOrCreateSection(guild_id);
    const role = section.get(role_id);
    section.delete(role_id);
    if (dispatch) {
        PublicDispatcher.dispatch({type: action.t, data: role});
    }
}

StoreManager.register(RoleStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_ROLE_CREATE:
            handleRoleCreateOrUpdate(action.payload as any, action.type, true);
        case ActionTypes.GUILD_ROLE_UPDATE:
            handleRoleCreateOrUpdate(action.payload as any, action.type, true);
        case ActionTypes.GUILD_ROLE_DELETE:
    }
});