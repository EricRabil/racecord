import { ChannelRecord } from "../../records/ChannelRecord";
import { GuildChannel } from "./GuildChannel";
import { TextBasedChannel } from "../../types/structures/channel/TextBasedChannel";
import { MessageRecord } from "../../records/MessageRecord";
import { MessageStore } from "../../stores/MessageStore";
import { post } from "../../util/HTTPUtils";
import { Endpoints } from "../../util/Constants";
import { SendableMessage } from "../../types/discord/channel/message";
import { createNonce } from "../../util/MiscUtils";
import { sendMessage, fetchMessages, MessageFetchQuery, fetchMessage, getPinnedMessages, addPin, removePin, typing } from "../../util/rest/actions/ChannelActions";
import { deleteMessages } from "../../util/rest/actions/MessageActions";
import { RawMessage } from "../../types/raw";

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
        return sendMessage(message, this);
    }

    public fetchMessages(query: MessageFetchQuery) {
        return fetchMessages(this, query);
    }

    public fetchMessage(id: string) {
        return fetchMessage(this, id);
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

    public getPinnedMessages(): Promise<Map<string, MessageRecord>> {
        return getPinnedMessages(this);
    }

    public pin(message: RawMessage): Promise<void> {
        return addPin(this, message);
    }

    public unpin(message: RawMessage): Promise<void> {
        return removePin(this, message);
    }

    public triggerTyping(): Promise<void> {
        return typing(this);
    }
}