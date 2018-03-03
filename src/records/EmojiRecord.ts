import { Record } from "../classes/Record";
import { RawEmoji, RawRole, RawUser, RawGuild } from "../types/raw";
import { UserStore, GuildStore } from "../stores";
import { deleteEmoji, EmojiEdit, editEmoji } from "../util/rest/actions/EmojiActions";

export class EmojiRecord extends Record implements RawEmoji {
    id: string;
    name: string;
    roles: RawRole[] = [];
    user: RawUser;
    require_colons: boolean = true;
    managed: boolean = false;
    animated: boolean = false;
    guild?: RawGuild;

    public constructor(data: RawEmoji, guild?: string) {
        super();
        this.assign(data);
        const userID = this.user.id;
        this.readonly("user", () => UserStore.getUser(userID));
        this.readonly("animated", this.animated);
        this.readonly("id", this.id);
        this.readonly("guild", () => guild && GuildStore.guilds.get(guild));
    }

    public deleteEmoji(): Promise<void> {
        if (!this.guild) {
            return new Promise(resolve => resolve());
        }
        return deleteEmoji(this.guild, this);
    }

    public editEmoji(edits: EmojiEdit): Promise<void> {
        if (!this.guild) {
            return new Promise(resolve => resolve());
        }
        return editEmoji(this.guild, this, edits) as any;
    }
}