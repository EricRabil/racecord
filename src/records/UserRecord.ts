import { Record } from "../classes/Record";
import { RawUser } from "../types/raw/RawUser";

export class UserRecord extends Record implements RawUser {

    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean | undefined;
    mfa_enabled?: boolean | undefined;
    verified?: boolean | undefined;
    email?: string | undefined;

    public constructor(data: RawUser) {
        super();
        this.assign(data);
    }
    
}