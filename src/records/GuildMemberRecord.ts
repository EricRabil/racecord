import { Record } from "../classes/Record";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { RawUser } from "../types/raw/RawUser";
import { UserStore, GuildStore, RoleStore } from "../stores/index";
import { UserRecord } from "./UserRecord";
import { RawGuild, RawRole } from "../types/raw";
import { GuildRecord, RoleRecord } from ".";
import { EditGuildMemberRequest, editMember, addRoleToMember, removeRoleFromMember, kickMember, BanOptions, banUser, removeBan, setSelfNickname } from "../util/rest/actions/GuildActions";

export class GuildMemberRecord extends Record implements RawGuildMember {

    nick?: string | undefined;
    roles: string[];
    joined_at: string;
    deaf: boolean;
    mute: boolean;
    readonly user: UserRecord;
    readonly guild: GuildRecord;
    readonly id: string;
    readonly self: boolean;
    private readonly guildID: string;

    public constructor(data: RawGuildMember, guild: string) {
        super();
        this.assign(data);
        this.readonly("user", () => UserStore.getUser(data.user.id));
        this.readonly("guildID", guild);
        this.readonly("guild", () => GuildStore.guilds.get(this.guildID));
        this.readonly("id", this.user.id);
        this.readonly("self", UserStore.getCurrentUser().id === this.id);
    }

    /**
     * Applies the given patches to this guild member
     * @param patches the patches to apply
     */
    public edit(patches: EditGuildMemberRequest): Promise<void> {
        return editMember(this.guildID, this.id, patches);
    }

    /**
     * Sets the voice channel for this guild member
     * @param channel_id the new voice channel
     */
    public setVoiceChannel(channel_id: string): Promise<void> {
        return this.edit({channel_id});
    }

    /**
     * Adds a role to this member
     * @param role the role to add
     */
    public addRole(role: RawRole | string): Promise<void> {
        return addRoleToMember(this.guildID, this.id, typeof role === "string" ? role : role.id);
    }

    /**
     * A map of role-IDs to role records
     */
    public get roleMap(): Map<string, RoleRecord> {
        const roleMap: Map<string, RoleRecord> = new Map();
        for (const role of this.roles) {
            roleMap.set(role, RoleStore.getOrCreateSection(this.guildID).get(role) as RoleRecord);
        }
        return roleMap;
    }

    /**
     * Revokes a role from this member
     * @param role the role to revoke
     */
    public removeRole(role: RawRole | string): Promise<void> {
        return removeRoleFromMember(this.guildID, this.id, typeof role === "string" ? role : role.id);
    }

    /** Kicks a member from their guild */
    public kick(): Promise<void> {
        return kickMember(this.guildID, this.id);
    }

    /**
     * Bans a member from their guild
     * @param options the ban options
     */
    public ban(options?: BanOptions): Promise<void> {
        return banUser(this.guildID, this.id, options);
    }

    /** Unbans a member from their guild */
    public unban(): Promise<void> {
        return removeBan(this.guildID, this.id);
    }

    /**
     * Sets the nickname for this memeber
     * @param nickname the new nickname
     */
    public setNickname(nickname: string): Promise<string> {
        return this.self ? setSelfNickname(this.guildID, nickname) : this.edit({nick: nickname}).then(() => nickname);
    }
    
}