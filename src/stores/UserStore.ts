import { Store } from "../types/structures/store";
import { UserRecord } from "../records/UserRecord";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { ReadyPayload, GuildMemberAddPayload, PresenceUpdatePayload } from "../util/gateway/GatewayEvents";
import { RawUser } from "../types/raw/RawUser";
import { RawGuild } from "../types/raw/RawGuild";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Pending } from "../helpers/Pending";
import { SelfUser } from "../classes/SelfUser";
import { PublicDispatcher } from "../util/Dispatcher";
import { getRoles } from "./RoleStore";
import { GuildStore } from ".";
import { Presence } from "../types/discord/user/presence";

const users: Map<string, UserRecord> = new Map();
let currentUserId: string;
const waiter: Pending<UserRecord> = new Pending();

export class UserStoreImpl implements Store<UserRecord> {
    /**
     * Gets a user by their ID
     * 
     * @param id the user snowflake
     */
    public getUser(id: string): UserRecord {
        return users.get(id) as UserRecord;
    }

    /**
     * Gets the current user
     */
    public getCurrentUser(): SelfUser {
        return users.get(currentUserId) as SelfUser;
    }

    public get users() {
        return users;
    }

    public async findOrCreate(id: string): Promise<UserRecord | undefined> {
        let user: RawUser | UserRecord | undefined = users.get(id);
        if (user) {
            return user as UserRecord;
        } else if (user = await getEntity<RawUser>(Endpoints.USER_INTERACT(id))) {
            return addOrMergeUser(user);
        }
    }

    public once(id: string): Promise<UserRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }
}

export const UserStore = new UserStoreImpl();

/**
 * Called when a fresh user object is encountered, either by REST or otherwise.
 * @param user the user that has been uptaken.
 */
export function addOrMergeUser(user: RawUser, dispatchUpdate: boolean = false): UserRecord | undefined {
    if (!user) {
        return;
    }
    let userRecord = users.get(user.id);
    if (!userRecord) {
        userRecord = new (user.id === currentUserId ? SelfUser : UserRecord)(user);
        waiter.emit(userRecord.id, userRecord);
        users.set(user.id, userRecord);
    } else {
        userRecord.merge(user);
    }
    if (dispatchUpdate) {
        PublicDispatcher.dispatch({
            type: ActionTypes.USER_UPDATE,
            data: userRecord
        });
    }
    return userRecord;
}

async function handlePresenceUpdate(update: PresenceUpdatePayload) {
    const {afk, game, since, status} = update.d;
    if (typeof afk === "undefined" && typeof game === "undefined" && typeof since === "undefined" && typeof status === "undefined") {
        return;
    }
    const {id} = update.d.user;
    const user = (await UserStore.findOrCreate(id)) as UserRecord;
    if (!user.presence) {
        user.presence = {
            game,
            status,
            since,
            afk
        };
    } else {
        user.presence.afk = typeof afk === "undefined" ? user.presence.afk : afk;
        user.presence.game = typeof game === "undefined" ? user.presence.game : game;
        user.presence.since = typeof since === "undefined" ? user.presence.since : since;
        user.presence.status = typeof status === "undefined" ? user.presence.status : status;
    }
}

async function dispatchPresenceUpdate(update: PresenceUpdatePayload) {
    const guild = update.d.guild_id ? await GuildStore.findOrCreate(update.d.guild_id) : undefined;
    const user = (await UserStore.findOrCreate(update.d.user.id)) as UserRecord;
    PublicDispatcher.dispatch({
        type: ActionTypes.PRESENCE_UPDATE,
        data: {
            user,
            roles: guild ? await getRoles(update.d.roles || [], guild.id) : undefined,
            guild,
            ...(user.presence as Presence)
        }
    });
}

StoreManager.register(UserStore, action => {
    switch (action.type) {
        case ActionTypes.READY:
            const readyPayload = (action.payload as ReadyPayload).d;
            currentUserId = readyPayload.user.id;
            addOrMergeUser(readyPayload.user);
            break;
        case ActionTypes.GUILD_CREATE:
            const guild = action.data as RawGuild;
            if (!guild.members) {
                break;
            }
            for (const member of guild.members) {
                if (!member.user) {
                    continue;
                }
                addOrMergeUser(member.user);
            }
            break;
        case ActionTypes.GUILD_MEMBER_ADD:
            addOrMergeUser((action.payload as GuildMemberAddPayload).d.user);
            break;
        case ActionTypes.USER_UPDATE:
            addOrMergeUser(action.data);
            break;
        case ActionTypes.PRESENCE_UPDATE:
            handlePresenceUpdate(action.data);
            dispatchPresenceUpdate(action.data);
            break;
        default:
            break;
    }
});