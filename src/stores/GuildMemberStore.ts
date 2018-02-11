import { Store } from "../types/structures/store";
import { GuildMemberRecord } from "../records/GuildMemberRecord";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { StoreManager } from "../util/StoreManager";
import { GuildStore } from "./index";
import { ActionTypes, ActionType } from "../types/structures/action";
import { GuildMemberAddPayload } from "../util/gateway/GatewayEvents";
import { GuildRecord } from "../records/GuildRecord";
import { RawGuild, RawGuildSelector } from "../types/raw/RawGuild";
import { PublicDispatcher } from "../util/Dispatcher";

const guildMembers: Map<string, Map<string, GuildMemberRecord>> = new Map();

export const GuildMemberStore = new class implements Store {
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

    public get memberMap() {
        return guildMembers;
    }

    /**
     * Returns a map of all tracked members in a guild
     * @param guild the guild ID
     */
    public membersFor(guild: RawGuild | string): Map<string, GuildMemberRecord> {
        const id = typeof guild === "string" ? guild : guild.id;
        return guildMembers.get(id) as Map<string, GuildMemberRecord>;
    }
}

function handleGuildMemberAddOrUpdate(member: RawGuildMember, guild?: string, type?: ActionType) {
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
        memberRecord = new GuildMemberRecord(member);
        memberList.set(id, memberRecord);
    } else {
        existing.merge(member);
        memberRecord = existing;
    }
    if (type) {
        PublicDispatcher.dispatch({type, data: memberRecord});
    }
}

function bulkMemberIntake(members: RawGuildMember[], guild?: string) {
    for (let i = 0; i < members.length; i++) {
        handleGuildMemberAddOrUpdate(members[i], guild);
    }
}

StoreManager.register(GuildStore, action => {
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
    }
})