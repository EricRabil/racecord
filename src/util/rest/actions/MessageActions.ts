import { MessageEdit } from "../../../types/discord/channel/message";
import { RawMessage } from "../../../types/raw/RawMessage";
import { patch, del, put } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { RawEmoji } from "../../../types/raw";

export function editMessage(edits: MessageEdit, message: RawMessage): Promise<void> {
    return patch({url: Endpoints.MODIFY_MESSAGE(message), body: edits}) as any;
}

export function deleteMessage(message: RawMessage): Promise<void> {
    return del({url: Endpoints.MODIFY_MESSAGE(message)}) as any;
}

function emojiToString(emoji: RawEmoji | string): string {
    return typeof emoji === "string" ? emoji : `${emoji.name}:${emoji.id}`;
}

export function reactToMessage(message: RawMessage, emoji: RawEmoji | string): Promise<void> {
    return put({url: Endpoints.MESSAGE_REACT(message, "@me", emojiToString(emoji))}) as any;
}

export function deleteReaction(message: RawMessage, user: string, emoji: RawEmoji | string): Promise<void> {
    return del({url: Endpoints.MESSAGE_REACT(message, user, emojiToString(emoji))}) as any;
}

export function deleteOwnReaction(message: RawMessage, emoji: RawEmoji | string): Promise<void> {
    return del({url: Endpoints.MESSAGE_REACT(message, "@me", emojiToString(emoji))}) as any;
}