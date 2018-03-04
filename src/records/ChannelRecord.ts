import { Record } from "../classes/Record";
import { RawChannel } from "../types/raw/RawChannel";
import { UserRecord } from "./UserRecord";
import { Overwrite } from "../types/discord/channel/overwrite";
import { post } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { SendableMessage } from "../types/discord/channel/message";
import { createNonce } from "../util/MiscUtils";
import { MessageStore, GuildStore } from "../stores/index";
import { MessageRecord } from "./MessageRecord";
import { deleteChannel } from "../util/rest/actions/ChannelActions";
import { GuildRecord } from ".";

export class ChannelRecord extends Record implements RawChannel {

    id: string;
    type: number;
    guild_id?: string;
    position?: number;
    permission_overwrites?: Overwrite[];
    name?: string;
    topic?: string;
    nsfw?: boolean;
    last_message_id?: string | null;
    bitrate?: number;
    user_limit?: number;
    recipients?: UserRecord[];
    icon?: string | null;
    owner_id?: string;
    application_id?: string;
    parent_id?: string | null;
    last_pin_timestamp?: string;

    guild?: GuildRecord;

    public constructor(data: RawChannel) {
        super();
        this.assign(data);
        this.readonly("id", this.id);
        this.readonly("type", this.type);
        this.readonly("guild", () => GuildStore.guilds.get(this.guild_id as string));
    }

    /** Deletes this channel */
    public deleteChannel(): Promise<void> {
        return deleteChannel(this.id);
    }
    
}