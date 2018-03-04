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
        this.assign(data);
        this.readonly("id", this.id);
        this.readonly("guild", () => GuildStore.guilds.get(guild));
    }

    /**
     * Applies the given edits to the channel
     * @param edits the edits to apply
     */
    public edit(edits: RoleEdit): Promise<void> {
        return editRole(this.guild.id, this.id, edits) as Promise<any>;
    }

    /** Deletes this role */
    public remove(): Promise<void> {
        return deleteRole(this.guild.id, this.id);
    }

    /**
     * Changes the name of this role
     * @param name the new name
     */
    public setName(name: string): Promise<void> {
        return this.edit({name});
    }

    /**
     * Changes the permissions of this role
     * @param permissions the new permissions
     */
    public setPermissions(permissions: number): Promise<void> {
        return this.edit({permissions});
    }

    /**
     * Changes the color of this role
     * @param color the new color
     */
    public setColor(color: number): Promise<void> {
        return this.edit({color});
    }

    /**
     * Sets whether this is a hoisted role (cosmetic only)
     * @param hoist the hoist status
     */
    public setHoist(hoist: boolean): Promise<void> {
        return this.edit({hoist});
    }

    /**
     * Sets whether this role is mentionable
     * @param mentionable the new mentionable boolean
     */
    public setMentionable(mentionable: boolean): Promise<void> {
        return this.edit({mentionable});
    }
}