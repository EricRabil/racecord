import { Record } from "../classes/Record";
import { RawUser } from "../types/raw/RawUser";
import { DMChannel } from "../classes/channel";
import { createDirectMessage } from "../util/rest/actions/UserActions";
import { ChannelStore, UserStore } from "../stores";
import { Endpoints } from "../util/Constants";
import { Presence } from "../types/discord/user/presence";

export class UserRecord extends Record implements RawUser {

    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean | undefined;
    mfa_enabled?: boolean | undefined;
    verified?: boolean | undefined;
    email?: string | undefined;

    dmChannel?: DMChannel;
    presence?: Presence;

    public constructor(data: RawUser) {
        super();
        this.assign(data);
        this.readonly("dmChannel", () => ChannelStore.dmChannelsByUID.get(this.id));
    }

    /** Opens a DM with this user */
    public createDM(): Promise<DMChannel> {
        return UserStore.getCurrentUser().openDM(this.id);
    }
    
}
