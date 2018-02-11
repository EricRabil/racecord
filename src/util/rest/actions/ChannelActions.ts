import { SendableMessage } from "../../../types/discord/channel/message";
import { RawChannel } from "../../../types/raw/RawChannel";
import { MessageRecord } from "../../../records/MessageRecord";
import { createNonce } from "../../MiscUtils";
import { post, patch } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { MessageStore } from "../../../stores/index";
import { Overwrite } from "../../../types/discord/channel/overwrite";
import { ChannelRecord } from "../../../records";

export interface GuildChannelModifications {
    name?: string;
    position?: number;
    topic?: string;
    nsfw?: boolean;
    bitrate?: number;
    user_limit?: number;
    permission_overwrites?: Overwrite[];
    parent_id?: string;
};

export function sendMessage(message: SendableMessage, channel: RawChannel): Promise<MessageRecord> {
    return new Promise((resolve, reject) => {
        const nonce = createNonce();
        message.nonce = nonce;
        post({url: Endpoints.SEND_MESSAGE(channel), body: message});
        MessageStore.registerNonce(nonce, (messageRecord) => resolve(messageRecord));
    });
}

export function editChannel(channel: ChannelRecord, edits: GuildChannelModifications): Promise<void> {
    return patch({url: Endpoints.CHANNEL_INTERACT(channel), body: edits}) as any;
}