import { ChannelRecord } from "../../records/ChannelRecord";
import { Overwrite } from "../../types/discord/channel/overwrite";
import { RawChannel } from "../../types/raw/RawChannel";
import { ChannelTypes } from "../../util/Constants";
import { GuildChannelModifications, editChannel, getInvites, InviteOptions, createInvite, editOverwrite, deleteOverwrite, deleteInvite, typing, getPinnedMessages, addPin, removePin } from "../../util/rest/actions/ChannelActions";
import { InviteRecord } from "../../records/InviteRecord";
import { RawInvite } from "../../types/raw/RawInvite";
import { MessageRecord } from "../../records";
import { RawMessage } from "../../types/raw";

export class GuildChannel extends ChannelRecord {
    public readonly guild_id: string;
    position: number;
    name: string;
    permission_overwrites: Overwrite[];
    nsfw: boolean;
    parent_id: string | null;

    public constructor(data: RawChannel) {
        super(data);
        if (data.type !== ChannelTypes.CATEGORY && data.type !== ChannelTypes.GUILD_TEXT && data.type !== ChannelTypes.GUILD_VOICE) {
            throw new Error("Raw channel is not of guild-channel type.");
        }
        this.readonly("guild_id", this.guild_id);
    }

    public setName(name: string): Promise<void> {
        return this.edit({name});
    }

    public setPosition(position: number): Promise<void> {
        return this.edit({position});
    }

    public setPermissionOverwrites(permission_overwrites: Overwrite[]): Promise<void> {
        return this.edit({permission_overwrites});
    }

    public editOverwrite(overwrite: Overwrite): Promise<void> {
        return editOverwrite(this, overwrite);
    }

    public deleteOverwrite(overwrite: Overwrite): Promise<void> {
        return deleteOverwrite(this, overwrite);
    }

    public setParentID(parent_id: string): Promise<void> {
        return this.edit({parent_id});
    }

    public edit(edits: GuildChannelModifications): Promise<void> {
        return editChannel(this, edits);
    }

    public getInvites(): Promise<InviteRecord[]> {
        return getInvites(this);
    }

    public async getInviteMap(): Promise<Map<string, InviteRecord>> {
        const invites = await this.getInvites();
        const inviteMap: Map<string, InviteRecord> = new Map();
        for (const invite of invites) {
            inviteMap.set(invite.code, invite);
        }
        return inviteMap;
    }

    public createInvite(options: InviteOptions = {}): Promise<InviteRecord> {
        return createInvite(this, options);
    }

    public deleteInvite(invite: string | RawInvite): Promise<void> {
        return deleteInvite(invite);
    }

}