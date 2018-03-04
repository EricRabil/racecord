import { Record } from "../classes/Record";
import { RawBan, RawGuild } from "../types/raw";
import { UserRecord, GuildRecord } from ".";
import { UserStore, GuildStore } from "../stores";
import { removeBan } from "../util/rest/actions/GuildActions";

export class BanRecord extends Record implements RawBan {
    reason: string | null;
    user: UserRecord;
    guild: GuildRecord;

    public constructor(data: RawBan, guild: RawGuild) {
        super();
        this.assign(data);
        this.readonly("user", () => UserStore.getUser(data.user.id));
        this.readonly("guild", () => GuildStore.guilds.get(guild.id));
    }

    public pardonBan(): Promise<void> {
        return removeBan(this.guild.id, this.user.id);
    }
}