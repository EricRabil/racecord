import { Record } from "../classes/Record";
import { RawRole, RawGuild } from "../types/raw";
import { GuildRecord } from ".";
import { GuildStore } from "../stores";
import { RoleEdit, editRole, deleteRole } from "../util/rest/actions/GuildActions";

export class RoleRecord extends Record implements RawRole {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: number;
    managed: boolean;
    mentionable: boolean;
    guild: GuildRecord;

    public constructor(data: RawRole, guild: string) {
        super();
        this.merge(data);
        this.readonly("id", this.id);
        this.readonly("guild", () => GuildStore.guilds.get(guild));
    }

    public edit(edits: RoleEdit): Promise<void> {
        return editRole(this.guild.id, this.id, edits) as Promise<any>;
    }

    public remove(): Promise<void> {
        return deleteRole(this.guild.id, this.id);
    }

    public setName(name: string): Promise<void> {
        return this.edit({name});
    }

    public setPermissions(permissions: number): Promise<void> {
        return this.edit({permissions});
    }

    public setColor(color: number): Promise<void> {
        return this.edit({color});
    }

    public setHoist(hoist: boolean): Promise<void> {
        return this.edit({hoist});
    }

    public setMentionable(mentionable: boolean): Promise<void> {
        return this.edit({mentionable});
    }
}