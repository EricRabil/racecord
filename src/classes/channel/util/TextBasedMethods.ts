import { SendableMessage } from "../../../types/discord/channel/message";
import { MessageRecord } from "../../../records";
import { createNonce } from "../../../util/MiscUtils";
import { MessageStore } from "../../../stores";
import { sendMessage as sendRawMessage } from "../../../util/rest/actions/ChannelActions";

export namespace TextBasedMethods {
    /**
     * Sends a message for a text-based channel
     * 
     * @param message the sendable message payload
     * @param channel the channel ID
     */
    export function sendMessage(message: SendableMessage, channel: string): Promise<MessageRecord> {
        const nonce = createNonce();
        message.nonce = nonce;
        return new Promise((resolve, reject) => {
            sendRawMessage(message, channel).catch(reject);
            resolve();
        }).then(() => MessageStore.once(nonce));
    }
}