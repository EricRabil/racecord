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

const users: Map<string, UserRecord> = new Map();
let currentUserId: string;
const waiter: Pending<UserRecord> = new Pending();

export const UserStore = new class implements Store<UserRecord> {
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

export function addOrMergeUser(user: RawUser): UserRecord | undefined {
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
    return userRecord;
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
    }
})