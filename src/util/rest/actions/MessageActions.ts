import { MessageEdit } from "../../../types/discord/channel/message";
import { RawMessage } from "../../../types/raw/RawMessage";
import { patch, del, put, post } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { RawEmoji, RawChannel } from "../../../types/raw";

export function editMessage(edits: MessageEdit, message: RawMessage): Promise<void> {
    return patch({url: Endpoints.MODIFY_MESSAGE(message.channel_id, message.id), body: edits}) as any;
}

export function deleteMessage(message: RawMessage): Promise<void> {
    return del({url: Endpoints.MODIFY_MESSAGE(message.channel_id, message.id)}) as any;
}

function emojiToString(emoji: RawEmoji | string): string {
    return typeof emoji === "string" ? emoji : `${emoji.name}:${emoji.id}`;
}

export function reactToMessage(message: RawMessage, emoji: RawEmoji | string): Promise<void> {
    return put({url: Endpoints.MESSAGE_REACT(message.channel_id, message.id, "@me", emojiToString(emoji))}) as any;
}

export function deleteReaction(message: RawMessage, user: string, emoji: RawEmoji | string): Promise<void> {
    return del({url: Endpoints.MESSAGE_REACT(message.channel_id, message.id, user, emojiToString(emoji))}) as any;
}

export function deleteOwnReaction(message: RawMessage, emoji: RawEmoji | string): Promise<void> {
    return del({url: Endpoints.MESSAGE_REACT(message.channel_id, message.id, "@me", emojiToString(emoji))}) as any;
}

export function deleteMessages(channel: RawChannel, messages: string[] | RawMessage[]): Promise<void> {
    if (typeof messages[0] !== "string") {
        const _messages = messages;
        messages = [];
        for (const message of _messages) {
            if (typeof message === "string") {
                (messages as any[]).push(message);
                continue;
            }
            (messages as any[]).push(message.id);
        }
    }
    return post({url: Endpoints.BULK_DELETE(channel.id), body: messages}) as any;
}