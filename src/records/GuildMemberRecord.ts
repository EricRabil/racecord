import { Record } from "../classes/Record";
import { RawGuildMember } from "../types/raw/RawGuildMember";
import { RawUser } from "../types/raw/RawUser";
import { UserStore } from "../stores/index";
import { UserRecord } from "./UserRecord";

export class GuildMemberRecord extends Record implements RawGuildMember {

    nick?: string | undefined;
    roles: string[];
    joined_at: string;
    deaf: boolean;
    mute: boolean;
    user: UserRecord;

    public constructor(data: RawGuildMember) {
        super();
        this.assign(data);
        this.readonly("user", UserStore.getUser.bind(null, this.user.id));
    }
    
}