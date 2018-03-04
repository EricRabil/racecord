import { UserRecord, GuildRecord } from "../records";
import { DMChannel } from "./channel";
import { getDirectMessages, createDirectMessage } from "../util/rest/actions/UserActions";
import { ChannelStore, GuildStore } from "../stores";
import { createGuild, GuildCreate } from "../util/rest/actions/GuildActions";

export class SelfUser extends UserRecord {

    /**
     * The direct messages open on this bot (does not always reflect all channels, builds up as the client detects them)
     */
    public get dmChannels(): Map<string, DMChannel> {
        return ChannelStore.dmChannels;
    }

    /**
     * Creates or retrieves a DMChannel for a user
     * @param user the user to open
     */
    public openDM(user: string): Promise<DMChannel> {
        return createDirectMessage("@me", user).then(c => ChannelStore.once(c.id) as Promise<DMChannel>);
    }

    public createDM(): Promise<DMChannel> {
        throw new Error("Cannot create a DM to the same user.");
    }

    /**
     * Creates a guild
     * @param guildCreate the guild create request
     */
    public createGuild(guildCreate: GuildCreate): Promise<GuildRecord> {
        return createGuild(guildCreate).then(g => GuildStore.once(g.id));
    }
}