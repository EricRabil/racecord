import { RawUser } from "./RawUser";
import { Overwrite } from "../discord/channel/overwrite";

export interface RawChannel {
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
    recipients?: RawUser[];
    icon?: string | null;
    owner_id?: string;
    application_id?: string;
    parent_id?: string | null;
    last_pin_timestamp?: string;
}