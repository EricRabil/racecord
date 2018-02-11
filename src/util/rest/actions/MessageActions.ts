import { MessageEdit } from "../../../types/discord/channel/message";
import { RawMessage } from "../../../types/raw/RawMessage";
import { patch, del } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";

export function editMessage(edits: MessageEdit, message: RawMessage): Promise<void> {
    return patch({url: Endpoints.MODIFY_MESSAGE(message), body: edits}) as any;
}

export function deleteMessage(message: RawMessage): Promise<void> {
    return del({url: Endpoints.MODIFY_MESSAGE(message)}) as any;
}