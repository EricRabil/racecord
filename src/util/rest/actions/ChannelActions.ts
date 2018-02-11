import { SendableMessage } from "../../../types/discord/channel/message";
import { RawChannel } from "../../../types/raw/RawChannel";
import { MessageRecord } from "../../../records/MessageRecord";
import { createNonce } from "../../MiscUtils";
import { post } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { MessageStore } from "../../../stores/index";

export function sendMessage(message: SendableMessage, channel: RawChannel): Promise<MessageRecord> {
    return new Promise((resolve, reject) => {
        const nonce = createNonce();
        message.nonce = nonce;
        post({url: Endpoints.SEND_MESSAGE(channel), body: message});
        MessageStore.registerNonce(nonce, (messageRecord) => resolve(messageRecord));
    });
}