import { SendableMessage } from "../../discord/channel/message";
import { MessageRecord } from "../../../records/MessageRecord";
import { MessageFetchQuery } from "../../../util/rest/actions/ChannelActions";

export interface TextBasedChannel {
    last_message_id: string;

    sendMessage(message: SendableMessage): Promise<MessageRecord>;
    fetchMessages(query?: MessageFetchQuery): Promise<Map<string, MessageRecord>>;
    fetchMessage(id: string): Promise<MessageRecord | undefined>;
}