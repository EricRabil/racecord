import {ChannelRecord} from "../../records/ChannelRecord";
import {TextBasedChannel} from "../../types/structures/channel/TextBasedChannel";
import { RawUser } from "../../types/raw/RawUser";
import { UserRecord } from "../../records/UserRecord";
import { SendableMessage } from "../../types/discord/channel/message";
import { MessageRecord } from "../../records/MessageRecord";
import { sendMessage, MessageFetchQuery, fetchMessages, fetchMessage, addDMRecipient, removeDMRecipient, getPinnedMessages, addPin, removePin, typing } from "../../util/rest/actions/ChannelActions";
import { RawEmoji, RawMessage } from "../../types/raw";
import { deleteMessages } from "../../util/rest/actions/MessageActions";

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
        return sendMessage(message, this);
    }

    public fetchMessages(query: MessageFetchQuery) {
        return fetchMessages(this, query);
    }

    public fetchMessage(id: string) {
        return fetchMessage(this, id);
    }

    public deleteMessages(messages: string[] | RawMessage[]) {
        return deleteMessages(this, messages);
    }

    public addRecipient(user: RawUser): Promise<void> {
        return addDMRecipient(this, user);
    }

    public removeRecipient(user: RawUser): Promise<void> {
        return removeDMRecipient(this, user);
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