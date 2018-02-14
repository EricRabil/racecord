import { Record } from "../classes/Record";
import { RawInvite } from "../types/raw/RawInvite";
import { GuildRecord, ChannelRecord } from ".";
import { GuildStore, ChannelStore } from "../stores";

export class InviteRecord extends Record implements RawInvite {
    code: string;
    guild: GuildRecord;
    channel: ChannelRecord;

    public constructor(rawInvite: RawInvite) {
        super();
        this.assign(rawInvite);
        const guildID = this.guild.id;
        const channelID = this.channel.id;
        this.readonly("guild", GuildStore.guilds.get.bind(GuildStore.guilds, guildID));
        this.readonly("channel", ChannelStore.channels.get.bind(ChannelStore.channels, channelID));
    }
}