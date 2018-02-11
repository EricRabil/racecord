import { ChannelRecord } from "../../records/ChannelRecord";
import { GuildChannel } from "./GuildChannel";
import { TextBasedChannel } from "../../types/structures/channel/TextBasedChannel";
import { MessageRecord } from "../../records/MessageRecord";
import { MessageStore } from "../../stores/MessageStore";
import { post } from "../../util/HTTPUtils";
import { Endpoints } from "../../util/Constants";
import { SendableMessage } from "../../types/discord/channel/message";
import { createNonce } from "../../util/MiscUtils";
import { sendMessage } from "../../util/rest/actions/ChannelActions";

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
}