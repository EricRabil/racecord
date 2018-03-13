import { RoleRecord } from "../records/RoleRecord";
import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { GuildRoleCreateOrEditPayload, Payload, GuildRoleDeletePayload, GuildCreatePayload, GuildDeletePayload } from "../util/gateway/GatewayEvents";
import { Pending } from "../helpers/Pending";
import { ActionType, ActionTypes } from "../types/structures/action";
import { PublicDispatcher } from "../util/Dispatcher";
import { RawRole } from "../types/raw";
import { GuildStore } from ".";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Analytics } from "../util/Analytics";

const roles: Map<string, Map<string, RoleRecord>> = new Map();
const waiter: Pending<RoleRecord> = new Pending();

export class RoleStoreImpl implements Store<RoleRecord> {

    public getOrCreateSection = getOrCreateSection;

    public async findOrCreate(id: string, guild?: string): Promise<RoleRecord | undefined> {
        let role: RawRole | RoleRecord | undefined = guild && getOrCreateSection(guild as string).get(id) || await recursiveRoleLookup(id);
        if (role) {
            return role as RoleRecord;
        } else if (guild && (role = await getEntity<RawRole>(Endpoints.GUILD_ROLE(guild as string, id)))) {
            return handleRoleCreateOrUpdate(role, guild, undefined, false);
        }
    }

    public get roles() {
        return roles;
    }

    public once(id: string): Promise<RoleRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }
}

export const RoleStore = new RoleStoreImpl();

/**
 * Recursively finds a role without its guild ID, possible performance hit with a lot of guilds or a lot of roles.
 * @param roleID the role to search for
 */
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
    let section: Map<string, RoleRecord> | undefined = roles.get(id);
    if (section) {
        return section;
    }
    section = new Map();
    roles.set(id, section);
    return section;
}

function handleRoleCreateOrUpdate(role: RawRole, guild: string, type?: "GUILD_ROLE_CREATE" | "GUILD_ROLE_UPDATE", dispatch: boolean = true): RoleRecord {
    Analytics.debug("RoleStore", `Role update trigger: RID ${role.id} GID ${guild} Type? ${type}`);
    const section = getOrCreateSection(guild);
    let roleRecord = section.get(role.id);
    if (roleRecord) {
        roleRecord.merge(role);
    } else {
        roleRecord = new RoleRecord(role, guild);
        section.set(roleRecord.id, roleRecord);
    }
    if (type && dispatch) {
        PublicDispatcher.dispatch({type, data: roleRecord});
    }
    if (type === ActionTypes.GUILD_ROLE_CREATE) {
        waiter.emit(roleRecord.id, roleRecord);
    }
    return roleRecord;
}

async function handleGuildCreate(action: GuildCreatePayload) {
    for (const role of action.d.roles) {
        handleRoleCreateOrUpdate(role, action.d.id);
    }
}

async function handleGuildDelete(action: GuildDeletePayload) {
    Analytics.debug("RoleStore", "Deleting role cluster for guild " + action.d.id)
    roles.delete(action.d.id);
}

function handleRoleDelete(action: GuildRoleDeletePayload, dispatch: boolean = true) {
    const {role_id, guild_id} = action.d;
    const section = getOrCreateSection(guild_id);
    const role = section.get(role_id);
    section.delete(role_id);
    if (dispatch) {
        PublicDispatcher.dispatch({type: action.t, data: role as RoleRecord});
    }
}

StoreManager.register(RoleStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_ROLE_CREATE:
            handleRoleCreateOrUpdate((action as any).d.role, (action as any).d.guild_id, action.type, true);
            break;
        case ActionTypes.GUILD_ROLE_UPDATE:
            handleRoleCreateOrUpdate((action as any).d.role, (action as any).d.guild_id, action.type, true);
            break;
        case ActionTypes.GUILD_ROLE_DELETE:
            handleRoleDelete(action.payload as any);
            break;
        case ActionTypes.GUILD_CREATE:
            handleGuildCreate(action.payload as any);
            break;
        case ActionTypes.GUILD_DELETE:
            handleGuildDelete(action.payload as any);
            break;
    }
});