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
import { ActionTypes, BaseAction } from "./types/structures/action";
import { StoreManager, StoreTracker } from "./util/StoreManager";
import * as MiscUtils from './util/MiscUtils';
import * as HTTPUtils from './util/HTTPUtils';
import {AnalyticUtils, Analytics} from "./util/Analytics";
import {Backoff} from "./util/rest/Backoff";
import * as Actions from "./util/rest/actions";
import * as SocketConstants from './util/gateway/SocketConstants';
import * as SocketConnection from './util/gateway/SocketConnection';
import * as GatewayEvents from './util/gateway/GatewayEvents';
import * as Stores from './stores/stores';
import * as StoreImplementations from './stores/implementations';
import * as Records from './records';
import {Record} from "./classes/Record";
import {GatewayConnection} from "./classes/GatewayConnection";
import * as Channels from './classes/channel';
import * as RawTypes from "./types/raw";
import { SendableMessage, MessageEdit } from "./types/discord/channel/message";
import { Client } from './classes/Client';
import { Overwrite } from './types/discord/channel/overwrite';
import { RawInvite } from './types/raw/RawInvite';
import { Commander, MessageEvent, Argument, CommandMetadata, StructuredArgument } from './commands/Commander';
import * as CommandSuite from './commands/CommandBuilder';
import * as ChannelActions from './util/rest/actions/ChannelActions';
import * as MessageActions from './util/rest/actions/MessageActions';
import * as GuildActions from './util/rest/actions/GuildActions';
import * as InviteActions from './util/rest/actions/InviteActions';
import * as VoiceActions from './util/rest/actions/VoiceActions';
import * as UserActions from './util/rest/actions/UserActions';
import * as WebhookActions from './util/rest/actions/WebhookActions';
import * as EmojiActions from './util/rest/actions/EmojiActions';
import * as Guards from "./commands/guards";
import * as Middleware from "./commands/middleware";
import { SelfUser } from './classes/SelfUser';
import { Presence } from './types/discord/user/presence';

Dispatcher.register(action => {
    if (action.type === ActionTypes.DEBUG) {
        console.log(`[${action.context.toUpperCase()}] ${action.data}`)
    }
});

/**
 * We don't use the key shorthand to prevent TypeScript magic renaming
 * 
 * We expose internal variables and classes to make the library as usable and customizable as possible.
 */
export = {
    actionTypes: ActionTypes,
    dispatcher: PublicDispatcher,
    httpUtils: HTTPUtils,
    client: Client,
    Commander: Commander,
    commands: {
        guards: {
            ...Guards,
        },
        middleware: {
            ...Middleware,
        },
        ...CommandSuite,
    },
    storeManager: StoreManager,
    stores: {
        ...Stores,
    },
    ...Records,
    SelfUser: SelfUser,
    internal: {
        actions: {
            ...Actions,
        },
        analytics: Analytics,
        AnalyticUtils: AnalyticUtils,
        Backoff: Backoff,
        gatewayConnection: GatewayConnection,
        gatewayEvents: GatewayEvents,
        internalDispatcher: Dispatcher,
        RacecordDispatcher: RacecordDispatcher,
        Record: Record,
        StoreTracker: StoreTracker,
        miscUtils: MiscUtils,
        SocketConnection: SocketConnection,
        socketConstants: SocketConstants,
        wrappers: {...Channels},
        storeImplementations: StoreImplementations
    },
};