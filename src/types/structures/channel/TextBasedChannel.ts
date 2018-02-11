import { SendableMessage } from "../../discord/channel/message";
import { MessageRecord } from "../../../records/MessageRecord";

export interface TextBasedChannel {
    last_message_id: string;

    sendMessage(message: SendableMessage): Promise<MessageRecord>;
}