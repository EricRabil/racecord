import { ChannelRecord } from "../../records/ChannelRecord";
import { GuildChannel } from "./GuildChannel";
import { TextBasedChannel } from "../../types/structures/channel/TextBasedChannel";
import { MessageRecord } from "../../records/MessageRecord";
import { MessageStore, mixedMessageInsert } from "../../stores/MessageStore";
import { post } from "../../util/HTTPUtils";
import { Endpoints } from "../../util/Constants";
import { SendableMessage } from "../../types/discord/channel/message";
import { createNonce } from "../../util/MiscUtils";
import { sendMessage, fetchMessages, MessageFetchQuery, fetchMessage, getPinnedMessages, addPin, removePin, typing } from "../../util/rest/actions/ChannelActions";
import { deleteMessages } from "../../util/rest/actions/MessageActions";
import { RawMessage } from "../../types/raw";

import { TextBasedMethods } from "./util/textBasedMethods";

export class TextChannel extends GuildChannel implements TextBasedChannel {
    last_message_id: string;
    topic: string;

    public get messages(): Map<string, MessageRecord> {
        return MessageStore.getMessagesForChannel(this.id);
    }

    /**
     * Sends a message in a given channel
     * 
     * @param message the message to send
     */
    public sendMessage(message: SendableMessage): Promise<MessageRecord> {
        return TextBasedMethods.sendMessage(message, this.id);
    }

    public async fetchMessages(query: MessageFetchQuery) {
        const messages = await mixedMessageInsert(Array.from((await fetchMessages(this.id, query)).values()));
        const messageMap: Map<string, MessageRecord> = new Map();
        for (const message of messages) {
            messageMap.set(message.id, message);
        }
        return messageMap;
    }

    public fetchMessage(id: string) {
        return MessageStore.findOrCreate(id, this.id);
    }

    public setTopic(topic: string): Promise<void> {
        return this.edit({topic});
    }

    public setNSFW(nsfw: boolean): Promise<void> {
        return this.edit({nsfw});
    }

    public deleteMessages(messages: string[] | RawMessage[]) {
        return deleteMessages(this, messages);
    }

    public async getPinnedMessages(): Promise<Map<string, MessageRecord>> {
        const messages = await mixedMessageInsert(Array.from((await getPinnedMessages(this.id)).values()));
        const messageMap: Map<string, MessageRecord> = new Map();
        for (const message of messages) {
            messageMap.set(message.id, message);
        }
        return messageMap;
    }

    public pin(message: RawMessage): Promise<void> {
        return addPin(this.id, message.id);
    }

    public unpin(message: RawMessage): Promise<void> {
        return removePin(this.id, message.id);
    }

    public triggerTyping(): Promise<void> {
        return typing(this.id);
    }
}