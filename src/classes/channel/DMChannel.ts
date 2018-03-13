import {ChannelRecord} from "../../records/ChannelRecord";
import {TextBasedChannel} from "../../types/structures/channel/TextBasedChannel";
import { RawUser } from "../../types/raw/RawUser";
import { UserRecord } from "../../records/UserRecord";
import { SendableMessage } from "../../types/discord/channel/message";
import { MessageRecord } from "../../records/MessageRecord";
import { sendMessage, MessageFetchQuery, fetchMessages, fetchMessage, addDMRecipient, removeDMRecipient, getPinnedMessages, addPin, removePin, typing } from "../../util/rest/actions/ChannelActions";
import { RawEmoji, RawMessage } from "../../types/raw";
import { deleteMessages } from "../../util/rest/actions/MessageActions";
import { MessageStore } from "../../stores";
import { createNonce } from "../../util/MiscUtils";
import { TextBasedMethods } from "./util/textBasedMethods";
import { mixedMessageInsert } from "../../stores/MessageStore";

export type DMGroupChannel = DMChannel & {
    owner_id: string;
    name: string;
    icon: string | null;
};

export class DMChannel extends ChannelRecord implements TextBasedChannel {
    last_message_id: string;
    recipients: UserRecord[];
    type: 1 | 3;

    /**
     * Returns whether this is a DMGroupChannel
    */
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

    /**
     * Fetches messages for this channel based on a given query
     * @param query 
     */
    public async fetchMessages(query: MessageFetchQuery) {
        return await mixedMessageInsert(Array.from((await fetchMessages(this.id, query)).values()));
    }

    /**
     * Fetch a specific message based on its ID
     * @param id the snowflake
     */
    public fetchMessage(id: string) {
        return MessageStore.findOrCreate(id, this.id);
    }

    /**
     * Delete a given array of message IDs
     * 
     * @param messages the messages to delete
     */
    public deleteMessages(messages: string[] | RawMessage[]) {
        return deleteMessages(this, messages);
    }

    /**
     * Add a user to a group DM
     * @param user the user to add
     */
    public addRecipient(user: RawUser): Promise<void> {
        return addDMRecipient(this.id, user.id);
    }

    /**
     * Remove a recipient from a group DM
     * @param user the user to remove
     */
    public removeRecipient(user: RawUser): Promise<void> {
        return removeDMRecipient(this.id, user.id);
    }

    /**
     * Get the pinned messages in this channel
    */
    public async getPinnedMessages(): Promise<Map<string, MessageRecord>> {
        return await mixedMessageInsert(Array.from((await getPinnedMessages(this.id)).values()));
    }

    /**
     * Pin a message to this channel
     * @param message the message to pin
     */
    public pin(message: RawMessage): Promise<void> {
        return addPin(this.id, message.id);
    }

    /**
     * Unpin a message from this channel
     * @param message the message to unpin
     */
    public unpin(message: RawMessage): Promise<void> {
        return removePin(this.id, message.id);
    }

    /**
     * Trigger the typing status for this channel
     */
    public triggerTyping(): Promise<void> {
        return typing(this.id);
    }

}