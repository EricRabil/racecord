import { RawUser } from "./RawUser";

export interface RawGuildMember {
    user: RawUser;
    nick?: string;
    roles: string[];
    joined_at: string;
    deaf: boolean;
    mute: boolean;
}