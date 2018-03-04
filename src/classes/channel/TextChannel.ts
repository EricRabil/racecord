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

    /**
     * A map of message-ids to message objects
     */
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

    /**
     * Fetch messages fitting the given query
     * @param query the query to use when fetching messages
     */
    public async fetchMessages(query: MessageFetchQuery) {
        const messages = await mixedMessageInsert(Array.from((await fetchMessages(this.id, query)).values()));
        const messageMap: Map<string, MessageRecord> = new Map();
        for (const message of messages) {
            messageMap.set(message.id, message);
        }
        return messageMap;
    }

    /**
     * Fetch a message with a given ID
     * @param id the ID of the message
     */
    public fetchMessage(id: string) {
        return MessageStore.findOrCreate(id, this.id);
    }

    /**
     * Sets the topic of this channel
     * @param topic the new topic
     */
    public setTopic(topic: string): Promise<void> {
        return this.edit({topic});
    }

    /**
     * Sets the NSFW state of this channel
     * @param nsfw the new NSFW state
     */
    public setNSFW(nsfw: boolean): Promise<void> {
        return this.edit({nsfw});
    }

    /**
     * Deletes the given message IDs
     * @param messages the messages to delete
     */
    public deleteMessages(messages: string[] | RawMessage[]) {
        return deleteMessages(this, messages);
    }

    /**
     * Gets the pinned messages for the channel
     */
    public async getPinnedMessages(): Promise<Map<string, MessageRecord>> {
        const messages = await mixedMessageInsert(Array.from((await getPinnedMessages(this.id)).values()));
        const messageMap: Map<string, MessageRecord> = new Map();
        for (const message of messages) {
            messageMap.set(message.id, message);
        }
        return messageMap;
    }

    /**
     * Pins a message to this channel
     * @param message the message to pin
     */
    public pin(message: RawMessage): Promise<void> {
        return addPin(this.id, message.id);
    }

    /**
     * Unpins a message from this channel
     * @param message the message to unpin
     */
    public unpin(message: RawMessage): Promise<void> {
        return removePin(this.id, message.id);
    }

    /**
     * Trigger typing for this channel
     */
    public triggerTyping(): Promise<void> {
        return typing(this.id);
    }
}