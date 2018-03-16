import { Store } from "../types/structures/store";
import { GuildMemberRecord } from "../records/GuildMemberRecord";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { StoreManager } from "../util/StoreManager";
import { GuildStore, UserStore, RoleStore } from "./index";
import { ActionTypes, ActionType } from "../types/structures/action";
import { GuildMemberAddPayload, PresenceUpdatePayload } from "../util/gateway/GatewayEvents";
import { GuildRecord } from "../records/GuildRecord";
import { RawGuild, RawGuildSelector } from "../types/raw/RawGuild";
import { PublicDispatcher } from "../util/Dispatcher";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Pending } from "../helpers/Pending";
import { addOrMergeUser } from "./UserStore";
import { getRoles } from "./RoleStore";
import { Presence } from "../types/discord/user/presence";

const guildMembers: Map<string, Map<string, GuildMemberRecord>> = new Map();
const waiter: Pending<GuildMemberRecord> = new Pending();

export class GuildMemberStoreImpl implements Store<GuildMemberRecord> {
    /**
     * An array of all members the client is keeping track of
     */
    public get members(): GuildMemberRecord[] {
        const values = Array.from(guildMembers.values());
        const members: GuildMemberRecord[] = [];
        for (let i = 0; i < values.length; i++) {
            const memberList = Array.from(values[i].values());
            for (let j = 0; j < memberList.length; j++) {
                members.push(memberList[j]);
            }
        }
        return members;
    }

    /**
     * A map of member ID to member records
     */
    public get memberMap() {
        return guildMembers;
    }

    /**
     * Gets a member from the stores with the given guild and ID
     * @param guild the guild ID
     * @param member the member ID
     */
    public getMember(guild: string, member: string): GuildMemberRecord | undefined {
        return getOrCreateSection(guild).get(member);
    }

    /**
     * Returns a map of all tracked members in a guild
     * @param guild the guild ID
     */
    public membersFor(guild: RawGuild | string): Map<string, GuildMemberRecord> {
        const id = typeof guild === "string" ? guild : guild.id;
        return guildMembers.get(id) as Map<string, GuildMemberRecord>;
    }

    /**
     * Gets all members for a given user
     * @param user the user ID
     */
    public membersForUser(user: string): Map<string, GuildMemberRecord> {
        const memberMap: Map<string, GuildMemberRecord> = new Map();
        for (const [guildID, memberStore] of guildMembers) {
            for (const [, member] of memberStore) {
                if (member.user.id === user) {
                    memberMap.set(guildID, member);
                }
            }
        }
        return memberMap;
    }

    public async findOrCreate(id: string, guild?: string): Promise<GuildMemberRecord | undefined> {
        if (!guild) {
            return;
        }
        const memberStore = guildMembers.get(guild);
        if (!memberStore) {
            return;
        }
        let member: RawGuildMember | GuildMemberRecord | undefined = memberStore.get(id);
        if (member) {
            return member as GuildMemberRecord;
        } else if (member = await getEntity<RawGuildMember>(Endpoints.GUILD_MEMBER(guild, id))) {
            return handleGuildMemberAddOrUpdate(member);
        }
    }

    public once(id: string): Promise<GuildMemberRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }
}

export const GuildMemberStore = new GuildMemberStoreImpl();

/**
 * Used to insert or update a member record with a raw member record.
 * 
 * Called whenever a fresh member record is encountered, either through REST or gateway.
 * 
 * @private
 * @param member the raw member to merge/create
 * @param guild the guild ID, if any. If it is not provided and there is no extra guild parameter in the member object, the function will not proceed.
 * @param type the action type, used for event re-dispatching.
 * @param dispatch whether we should actually re-dispatch.
 */
export function handleGuildMemberAddOrUpdate(member: RawGuildMember, guild?: string, type?: "GUILD_MEMBER_ADD" | "GUILD_MEMBER_UPDATE", dispatch: boolean = true): GuildMemberRecord | undefined {
    if (!guild) {
        const extraParam = (member as any).guild_id;
        if (extraParam) {
            guild = extraParam;
        } else {
            return;
        }
    }
    const memberList = guildMembers.get(guild as string) as Map<string, GuildMemberRecord>;
    const id = member.user.id;
    const existing = memberList.get(id);
    let memberRecord: GuildMemberRecord;
    if (!existing) {
        addOrMergeUser(member.user);
        memberRecord = new GuildMemberRecord(member, guild as string);
        waiter.emit(memberRecord.user.id, memberRecord);
        memberList.set(id, memberRecord);
    } else {
        existing.merge(member);
        memberRecord = existing;
    }
    if (type && dispatch) {
        PublicDispatcher.dispatch({type, data: memberRecord});
    }
    return memberRecord;
}

function getOrCreateSection(id: string): Map<string, GuildMemberRecord> {
    return guildMembers.get(id) || guildMembers.set(id, new Map()).get(id) as Map<string, GuildMemberRecord>;
}

/**
 * Takes an array of raw members and creates/updates them as well as returns a map of them.
 * @param guild the guild ID
 * @param members the array of raw members
 */
export function mixedMemberInsert(guild: string, members: RawGuildMember[]): Map<string, GuildMemberRecord> {
    const section = getOrCreateSection(guild);
    const sorted: Map<string, GuildMemberRecord> = new Map();
    for (const member of members) {
        const record = handleGuildMemberAddOrUpdate(member, guild, undefined, false) as GuildMemberRecord;
        sorted.set(record.user.id, record);
    }
    return sorted;
}

function bulkMemberIntake(members: RawGuildMember[], guild?: string) {
    for (let i = 0; i < members.length; i++) {
        handleGuildMemberAddOrUpdate(members[i], guild);
    }
}

async function handlePresenceUpdate(action: PresenceUpdatePayload) {
    const {guild_id, roles} = action.d;
    const {id} = action.d.user;
    if (!guild_id || !roles) {
        return;
    }
    const member = (await GuildMemberStore.findOrCreate(id, guild_id)) as GuildMemberRecord;
    if (!member) {
        return;
    }
    member.roles = roles;
}

StoreManager.register(GuildMemberStore, action => {
    switch (action.type) {
        case ActionTypes.GUILD_MEMBER_ADD:
            handleGuildMemberAddOrUpdate(action.data, undefined, action.type);
            break;
        case ActionTypes.GUILD_MEMBER_UPDATE:
            handleGuildMemberAddOrUpdate(action.data, undefined, action.type);
            break;
        case ActionTypes.GUILD_CREATE:
            guildMembers.set(action.data.id, new Map());
            bulkMemberIntake(action.data.members, action.data.id);
            break;
        case ActionTypes.GUILD_MEMBERS_CHUNK:
            bulkMemberIntake(action.data.members, action.data.guild_id);
            break;
        case ActionTypes.PRESENCE_UPDATE:
            handlePresenceUpdate(action.payload as any);
            break;
        default:
            break;
    }
})