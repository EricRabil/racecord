import {ChannelRecord} from "../../records/ChannelRecord";
import {TextBasedChannel} from "../../types/structures/channel/TextBasedChannel";
import { RawUser } from "../../types/raw/RawUser";
import { UserRecord } from "../../records/UserRecord";
import { SendableMessage } from "../../types/discord/channel/message";
import { MessageRecord } from "../../records/MessageRecord";
import { sendMessage } from "../../util/rest/actions/ChannelActions";

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
}