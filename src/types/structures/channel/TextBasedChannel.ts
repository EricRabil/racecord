import { SendableMessage } from "../../discord/channel/message";
import { MessageRecord } from "../../../records/MessageRecord";
import { MessageFetchQuery } from "../../../util/rest/actions/ChannelActions";
import { RawMessage } from "../../raw";

export interface TextBasedChannel {
    last_message_id: string;

    sendMessage(message: SendableMessage): Promise<MessageRecord>;
    fetchMessages(query?: MessageFetchQuery): Promise<Map<string, MessageRecord>>;
    fetchMessage(id: string): Promise<MessageRecord | undefined>;
    deleteMessages(messages: string[] | RawMessage[]): Promise<void>;
    triggerTyping(): Promise<void>;
    getPinnedMessages(): Promise<Map<string, MessageRecord>>;
    pin(message: RawMessage): Promise<void>;
    unpin(message: RawMessage): Promise<void>;
}