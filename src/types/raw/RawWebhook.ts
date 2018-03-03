import { RawUser } from ".";

export interface RawWebhook {
    id: string;
    guild_id?: string;
    channel_id: string;
    user?: RawUser;
    name: string | null;
    avatar: string | null;
    token?: string;
}
