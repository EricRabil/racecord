import {Store} from "../types/structures/store";
import {StoreManager} from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { MessageRecord } from "../records/MessageRecord";
import { SettingsStore } from "./SettingsStore";
import { RawMessage } from "../types/raw/RawMessage";
import { RawChannel } from "../types/raw/RawChannel";
import { PublicDispatcher } from "../util/Dispatcher";
import { Analytics } from "../util/Analytics";
import { ChannelRecord } from "../records";
import { getEntity } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { Pending } from "../helpers/Pending";
const Enmap = require("enmap");

const messages: Map<string, Map<string, MessageRecord>> = new Map();
const pendingNonces: Map<string, (message: MessageRecord) => any> = new Map();
const waiter: Pending<MessageRecord> = new Pending();

export const MessageStore = new class implements Store<MessageRecord> {
    /**
     * Returns a map of snowflakes to messages for a given channel
     * 
     * @param channel_id the channel snowflake
     */
    public getMessagesForChannel(id: string): Map<string, MessageRecord> {
        return getOrCreateSection({id});
    }

    /**
     * Registers a nonce that, when received, is called back with the created message
     * 
     * @param nonce the nonce
     * @param callback the callback
     */
    public registerNonce(nonce: string, callback: (message: MessageRecord) => any) {
        pendingNonces.set(nonce, callback);
    }

    public async findMessage(id: string, channel?: string): Promise<MessageRecord | undefined> {
        for (const [, messageStore] of channel ? [messages.get(channel) || []] : messages) {
            for (const [, message] of messageStore as Map<string, MessageRecord>) {
                if (message.id === id) {
                    return message;
                }
            }
        }
    }

    public async findOrCreate(id: string, channel?: string): Promise<MessageRecord | undefined> {
        let message: RawMessage | MessageRecord | undefined = await this.findMessage(id, channel);
        if (message) {
            return message as MessageRecord;
        } else if (channel && (message = await getEntity<RawMessage>(Endpoints.MODIFY_MESSAGE(channel, id)))) {
            return handleMessageCreate(message);
        }
    }

    public once(id: string): Promise<MessageRecord> {
        return new Promise((resolve) => waiter.enlist(id, resolve));
    }
}

function getOrCreateSection({id}: {id: string}): Map<string, MessageRecord> {
    let section = messages.get(id);
    if (!section) {
        section = new Map();
        messages.set(id, section);
    }
    return section;
}

function getMessage(id: string, channelID: string): MessageRecord | undefined {
    const section = messages.get(channelID);
    if (!section) {
        return undefined;
    }
    return section.get(id);
}

async function merge(message: Partial<MessageRecord>) {
    if (!message.id || !message.channel_id) {
        return;
    }
    const original = getMessage(message.id, message.channel_id);
    if (!original) {
        return;
    }
    original.merge(message);
}

/**
 * Deletes a message regardless of settings configuration
 * @param message the message to delete
 */
async function reallyDeleteMessage(message: Partial<RawMessage>) {
    const {id, channel_id} = message;
    if (!id || !channel_id) {
        return;
    }
    const section = messages.get(channel_id);
    if (!section) {
        return;
    }
    section.delete(id);
}

/**
 * Handles a message delete event. Depending on the settings configuration, the message may be retained in storage but flagged as removed.
 * @param message the message
 */
async function handleMessageDelete(message: RawMessage) {
    const section = messages.get(message.channel_id);
    if (section) {
        const oldMessage = section.get(message.id);
        PublicDispatcher.dispatch({type: ActionTypes.MESSAGE_DELETE, data: oldMessage});
    }
    if (SettingsStore.preserveDeletedMessages) {
        const {id, channel_id} = message;
        merge({id, channel_id, deleted: true});
        return;
    }
    reallyDeleteMessage(message);
}

function handleMessageCreate(message: RawMessage, dispatch: boolean = true): MessageRecord {
    const messageRecord = new MessageRecord(message);
    waiter.emit(message.nonce || message.id, messageRecord);
    if (messageRecord.nonce) {
        const callback = pendingNonces.get(messageRecord.nonce);
        pendingNonces.delete(messageRecord.nonce);
        if (callback) {
            callback(messageRecord);
        }
    }
    getOrCreateSection({id: message.channel_id}).set(message.id, messageRecord);
    if (dispatch) {
        PublicDispatcher.dispatch({type: ActionTypes.MESSAGE_CREATE, data: messageRecord});
    }
    return messageRecord;
}

function handleMessageEdit(message: RawMessage, dispatch: boolean = true): MessageRecord {
    let messageRecord = getOrCreateSection(message).get(message.id);
    if (messageRecord) {
        messageRecord.merge(message);
    } else {
        return handleMessageCreate(message, false);
    }
    if (dispatch) {
        PublicDispatcher.dispatch({type: ActionTypes.MESSAGE_UPDATE, data: messageRecord || message});
    }
    return messageRecord;
}

async function handleChannelCreate(channel: RawChannel) {
    messages.set(channel.id, new Map());
}

async function handleChannelDelete(channel: RawChannel) {
    if (SettingsStore.preserveDeletedMessages) {
        const section = messages.get(channel.id);
        if (!section) {
            return;
        }
        for (const [,message] of section) {
            message.deleted = true;
        }
        return;
    }
    messages.delete(channel.id);
}

/**
 * Called whenever a fresh array of messages are encountered, either from REST or otherwise.
 * 
 * Creates or updates records for all of the provided messages, returning a MessageRecord map.
 * @private
 * @param messages the raw message array
 */
export async function mixedMessageInsert(messages: RawMessage[]): Promise<Map<string, MessageRecord>> {
    const waitRecords: Array<Promise<MessageRecord>> = [];
    const records: Map<string, MessageRecord> = new Map();
    for (const message of messages) {
        const exists = getOrCreateSection({id: message.channel_id}).has(message.id);
        records.set(message.id, (exists ? handleMessageEdit : handleMessageCreate)(message, false));
    }
    return records;
}

StoreManager.register(MessageStore, (action) => {
    switch (action.type) {
        case ActionTypes.CHANNEL_CREATE:
            handleChannelCreate(action.data);
            break;
        case ActionTypes.CHANNEL_DELETE:
            handleChannelDelete(action.data);
            break;
        case ActionTypes.MESSAGE_CREATE:
            handleMessageCreate(action.data);
            break;
        case ActionTypes.MESSAGE_DELETE:
            handleMessageDelete(action.data);
            break;
        case ActionTypes.MESSAGE_UPDATE:
            handleMessageEdit(action.data);
            break;
        default:
            break;
    }
});