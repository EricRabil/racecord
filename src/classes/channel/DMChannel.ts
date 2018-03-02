import {ChannelRecord} from "../../records/ChannelRecord";
import {TextBasedChannel} from "../../types/structures/channel/TextBasedChannel";
import { RawUser } from "../../types/raw/RawUser";
import { UserRecord } from "../../records/UserRecord";
import { SendableMessage } from "../../types/discord/channel/message";
import { MessageRecord } from "../../records/MessageRecord";
import { sendMessage, MessageFetchQuery, fetchMessages, fetchMessage, addDMRecipient, removeDMRecipient, getPinnedMessages, addPin, removePin, typing } from "../../util/rest/actions/ChannelActions";
import { RawEmoji, RawMessage } from "../../types/raw";
import { deleteMessages } from "../../util/rest/actions/MessageActions";
import { MessageStore, mixedMessageInsert } from "../../stores";
import { createNonce } from "../../util/MiscUtils";
import { TextBasedMethods } from "./util/textBasedMethods";

export type DMGroupChannel = DMChannel & {
    owner_id: string;
    name: string;
    icon: string | null;
};

export class DMChannel extends ChannelRecord implements TextBasedChannel {
    last_message_id: string;
    recipients: UserRecord[];
    type: 1 | 3;

    public isGroupChannel(): this is DMGroupChannel {
        return "owner_id" in this && "name" in this;
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

    public deleteMessages(messages: string[] | RawMessage[]) {
        return deleteMessages(this, messages);
    }

    public addRecipient(user: RawUser): Promise<void> {
        return addDMRecipient(this.id, user.id);
    }

    public removeRecipient(user: RawUser): Promise<void> {
        return removeDMRecipient(this.id, user.id);
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