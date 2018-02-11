import { ChannelRecord } from "../../records/ChannelRecord";
import { Overwrite } from "../../types/discord/channel/overwrite";
import { RawChannel } from "../../types/raw/RawChannel";
import { ChannelTypes } from "../../util/Constants";
import { GuildChannelModifications, editChannel } from "../../util/rest/actions/ChannelActions";

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

    public setTopic(topic: string): Promise<void> {
        return this.edit({topic});
    }

    public setNSFW(nsfw: boolean): Promise<void> {
        return this.edit({nsfw});
    }

    public setBitrate(bitrate: number): Promise<void> {
        return this.edit({bitrate});
    }

    public setUserLimit(user_limit: number): Promise<void> {
        return this.edit({user_limit});
    }

    public setPermissionOverwrites(permission_overwrites: Overwrite[]): Promise<void> {
        return this.edit({permission_overwrites});
    }

    public setParentID(parent_id: string): Promise<void> {
        return this.edit({parent_id});
    }

    public edit(edits: GuildChannelModifications): Promise<void> {
        return editChannel(this, edits);
    }
}