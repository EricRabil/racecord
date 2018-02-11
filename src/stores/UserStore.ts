import { Store } from "../types/structures/store";
import { UserRecord } from "../records/UserRecord";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { ReadyPayload, GuildMemberAddPayload, PresenceUpdatePayload } from "../util/gateway/GatewayEvents";
import { RawUser } from "../types/raw/RawUser";
import { RawGuild } from "../types/raw/RawGuild";

const users: Map<string, UserRecord> = new Map();
let currentUserId: string;

export const UserStore = new class implements Store {
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
    public getCurrentUser(): UserRecord {
        return users.get(currentUserId) as UserRecord;
    }
}

function addOrMergeUser(user: RawUser) {
    if (!user) {
        return;
    }
    const existingUser = users.get(user.id);
    if (!existingUser) {
        users.set(user.id, new UserRecord(user));
    } else {
        existingUser.merge(user);
    }
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