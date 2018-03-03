import { Record } from "../classes/Record";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { RawUser } from "../types/raw/RawUser";
import { UserStore, GuildStore } from "../stores/index";
import { UserRecord } from "./UserRecord";
import { RawGuild, RawRole } from "../types/raw";
import { GuildRecord } from ".";
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

    public edit(patches: EditGuildMemberRequest): Promise<void> {
        return editMember(this.guildID, this.id, patches);
    }

    public setVoiceChannel(channel_id: string): Promise<void> {
        return this.edit({channel_id});
    }

    public addRole(role: RawRole | string): Promise<void> {
        return addRoleToMember(this.guildID, this.id, typeof role === "string" ? role : role.id);
    }

    public removeRole(role: RawRole | string): Promise<void> {
        return removeRoleFromMember(this.guildID, this.id, typeof role === "string" ? role : role.id);
    }

    public kick(): Promise<void> {
        return kickMember(this.guildID, this.id);
    }

    public ban(options?: BanOptions): Promise<void> {
        return banUser(this.guildID, this.id, options);
    }

    public unban(): Promise<void> {
        return removeBan(this.guildID, this.id);
    }

    public setNickname(nickname: string): Promise<string> {
        return this.self ? setSelfNickname(this.guildID, nickname) : this.edit({nick: nickname}).then(() => nickname);
    }
    
}