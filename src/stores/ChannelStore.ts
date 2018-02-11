import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { ChannelRecord } from "../records/ChannelRecord";
import { ChannelCreatePayload } from "../util/gateway/GatewayEvents";
import { RawChannel } from "../types/raw/RawChannel";
import { ChannelTypes } from "../util/Constants";
import { TextChannel } from "../classes/channel/TextChannel";
import { VoiceChannel } from "../classes/channel/VoiceChannel";
import { ChannelCategory } from "../classes/channel/ChannelCategory";
import { DMChannel } from "../classes/channel/DMChannel";
import { GuildChannel } from "../classes/channel/GuildChannel";
import { RawGuild } from "../types/raw/RawGuild";
import * as MiscUtils from "../util/MiscUtils";
const {readonly} = MiscUtils;
import { PublicDispatcher } from "../util/Dispatcher";

const channels: Map<string, ChannelRecord> = new Map();

export const ChannelStore = new class implements Store {

    textChannels: Map<string, TextChannel>;
    voiceChannels: Map<string, VoiceChannel>;
    dmChannels: Map<string, DMChannel>;
    channelCategories: Map<string, ChannelCategory>;

    public constructor() {
        readonly(this, "textChannels", channelFilterByInstance.bind(null, ChannelTypes.GUILD_TEXT));
        readonly(this, "voiceChannels", channelFilterByInstance.bind(null, ChannelTypes.GUILD_VOICE));
        readonly(this, "dmChannels", channelFilterByInstance.bind(null, ChannelTypes.DM));
        readonly(this, "channelCategories", channelFilterByInstance.bind(null, ChannelTypes.CATEGORY));
    }

    /**
     * A map of channel IDs to channel records
     */
    public get channels() {
        return channels;
    }

    /**
     * Returns all channels in a given guild
     * 
     * @param guild the guild to use for filtering
     */
    public getChannelsForGuild(guild: RawGuild | string): Map<string, ChannelRecord> {
        const query = typeof guild === "string" ? guild : guild.id;
        return channelFilterByGuild(query);
    }

    /**
     * Returns all channels in a given guild of a specific type
     * @param guild the guild to use for filtering
     * @param type the type
     */
    public getTypedChannelsForGuild (guild: RawGuild | string, type: number) {
        return channelFilterByInstance(type, typeof guild === "string" ? guild : guild.id);
    }
}

function channelFilterByGuild (guild: string): Map<string, ChannelRecord> {
    const channelMap: Map<string, ChannelRecord> = new Map();
    for (const [, channel] of channels) {
        if (channel.guild_id !== guild) {
            continue;
        }
        channelMap.set(channel.id, channel);
    }
    return channelMap;
}

function channelFilterByInstance (type: number, guild?: string): Map<string, ChannelRecord> {
    const channelMap: Map<string, ChannelRecord> = new Map();
    for (const channelSet of channels) {
        const [, channel] = channelSet;
        if (channel.type !== type) {
            continue;
        }
        if (guild && channel.guild_id !== guild) {
            continue;
        }
        channelMap.set(channel.id, channel);
    }
    return channelMap;
}

function handleChannelUpdate(channel: RawChannel) {
    const existing = channels.get(channel.id);
    if (existing) {
        existing.merge(channel);
        PublicDispatcher.dispatch({type: ActionTypes.CHANNEL_UPDATE, data: existing});
        return;
    }
}

function handleChannelAdd(channel: RawChannel) {
    let channelRecord: ChannelRecord;
    switch (channel.type) {
        case ChannelTypes.GUILD_TEXT:
            channelRecord = new TextChannel(channel);
            break;
        case ChannelTypes.GUILD_VOICE:
            channelRecord = new VoiceChannel(channel);
            break;
        case ChannelTypes.CATEGORY:
            channelRecord = new ChannelCategory(channel);
            break;
        case ChannelTypes.GROUP_DM:
            channelRecord = new DMChannel(channel);
            break;
        case ChannelTypes.DM:
            channelRecord = new DMChannel(channel);
            break;
        default:
            channelRecord = new ChannelRecord(channel);
            break;
    }
    channels.set(channel.id, channelRecord);
    PublicDispatcher.dispatch({type: ActionTypes.CHANNEL_CREATE, data: channelRecord});
}

function handleBulkChannelCreate(channels: RawChannel[], guild?: string) {
    for (const channel of channels) {
        if (guild) {
            channel.guild_id = guild;
        }
        handleChannelAdd(channel);
    }
}

function handleDeleteChannel(channel: RawChannel) {
    const channelRecord = channels.get(channel.id);
    if (channelRecord) {
        PublicDispatcher.dispatch({type: ActionTypes.CHANNEL_DELETE, channelRecord});
    }
    channels.delete(channel.id);
}

function handleBulkChannelDelete(channels: RawChannel[], guild?: string) {
    for (const channel of channels) {
        handleDeleteChannel(channel);
    }
}

StoreManager.register(ChannelStore, action => {
    switch (action.type) {
        case ActionTypes.CHANNEL_CREATE:
            handleChannelAdd(action.data);
            break;
        case ActionTypes.CHANNEL_DELETE:
            handleDeleteChannel(action.data);
            break;
        case ActionTypes.CHANNEL_UPDATE:
            handleChannelUpdate(action.data);
            break;
        case ActionTypes.GUILD_CREATE:
            handleBulkChannelCreate(action.data.channels, action.data.id);
        default:
            return false;
    }
});