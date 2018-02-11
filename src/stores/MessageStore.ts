import {Store} from "../types/structures/store";
import {StoreManager} from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { MessageRecord } from "../records/MessageRecord";
import { SettingsStore } from "./SettingsStore";
import { RawMessage } from "../types/raw/RawMessage";
import { RawChannel } from "../types/raw/RawChannel";
import { PublicDispatcher } from "../util/Dispatcher";
import { Analytics } from "../util/Analytics";

const messages: Map<string, Map<string, MessageRecord>> = new Map();
const pendingNonces: Map<string, (message: MessageRecord) => any> = new Map();

export const MessageStore = new class implements Store {
    /**
     * Returns a map of snowflakes to messages for a given channel
     * 
     * @param channel_id the channel snowflake
     */
    public getMessagesForChannel(channel_id: string): Map<string, MessageRecord> {
        return getOrCreateSection({channel_id});
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
}

function getOrCreateSection(message: {channel_id: string}): Map<string, MessageRecord> {
    let section = messages.get(message.channel_id);
    if (!section) {
        section = new Map();
        messages.set(message.channel_id, section);
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

async function handleMessageCreate(message: RawMessage) {
    const messageRecord = new MessageRecord(message);
    if (messageRecord.nonce) {
        const callback = pendingNonces.get(messageRecord.nonce);
        pendingNonces.delete(messageRecord.nonce);
        if (callback) {
            callback(messageRecord);
        }
    }
    getOrCreateSection(message).set(message.id, messageRecord);
    PublicDispatcher.dispatch({type: ActionTypes.MESSAGE_CREATE, data: messageRecord});
}

async function handleMessageEdit(message: RawMessage) {
    const messageRecord = getOrCreateSection(message).get(message.id);
    if (messageRecord) {
        messageRecord.merge(message);
    }
    PublicDispatcher.dispatch({type: ActionTypes.MESSAGE_UPDATE, data: messageRecord || message});
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