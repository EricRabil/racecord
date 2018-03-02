import { UserRecord } from './records/UserRecord';
import { MessageRecord } from './records/MessageRecord';
import { GuildRecord } from './records/GuildRecord';
import { GuildMemberRecord } from './records/GuildMemberRecord';
import { ChannelRecord } from './records/ChannelRecord';
import { VoiceChannel } from './classes/channel/VoiceChannel';
import { TextChannel } from './classes/channel/TextChannel';
import { RawGuild } from './types/raw/RawGuild';
import { GuildChannel } from './classes/channel/GuildChannel';
import { DMChannel, DMGroupChannel } from './classes/channel/DMChannel';
import { ChannelCategory } from './classes/channel/ChannelCategory';
import { Dispatcher, RacecordDispatcher, PublicDispatcher } from "./util/Dispatcher";
import { ActionTypes } from "./types/structures/action";
import { StoreManager, StoreTracker } from "./util/StoreManager";
import * as MiscUtils from './util/MiscUtils';
import * as HTTPUtils from './util/HTTPUtils';
import {AnalyticUtils, Analytics} from "./util/Analytics";
import {Backoff} from "./util/rest/Backoff";
import * as ChannelActions from './util/rest/actions/ChannelActions';
import * as MessageActions from './util/rest/actions/MessageActions';
import * as SocketConstants from './util/gateway/SocketConstants';
import * as SocketConnection from './util/gateway/SocketConnection';
import * as GatewayEvents from './util/gateway/GatewayEvents';
import * as Stores from './stores';
import * as Records from './records';
import {Record} from "./classes/Record";
import {GatewayConnection} from "./classes/GatewayConnection";
import * as Channels from './classes/channel';
import {RawChannel, RawMessage, RawEmoji} from "./types/raw";
import { SendableMessage, MessageEdit } from "./types/discord/channel/message";
import { Client } from './classes/Client';
import { Overwrite } from './types/discord/channel/overwrite';
import { RawInvite } from './types/raw/RawInvite';

Dispatcher.register((action) => {
    switch (action.type) {
        case ActionTypes.DEBUG:
            console.log(`[${action.context.toUpperCase()}] ${action.data}`);
            break;
    }
});

/**
 * We don't use the key shorthand to prevent TypeScript magic renaming
 * 
 * We expose internal variables and classes to make the library as usable and customizable as possible.
 */
export = {
    ActionTypes: ActionTypes,
    Dispatcher: PublicDispatcher,
    HTTPUtils: HTTPUtils,
    Client: Client,
    StoreManager: StoreManager,
    ...Channels,
    Stores: {
        ...Stores,
    },
    internal: {
        actions: {
            channel: {
                ...ChannelActions,
            },
            message: {
                ...MessageActions
            }
        },
        Analytics: Analytics,
        AnalyticUtils: AnalyticUtils,
        Backoff: Backoff,
        GatewayConnection: GatewayConnection,
        GatewayEvents: GatewayEvents,
        InternalDispatcher: Dispatcher,
        RacecordDispatcher: RacecordDispatcher,
        Record: Record,
        Records: Records,
        StoreTracker: StoreTracker,
        MiscUtils: MiscUtils,
        SocketConnection: SocketConnection,
        SocketConstants: SocketConstants,
    },
};