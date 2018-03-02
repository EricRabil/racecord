import { SendableMessage } from "../../../types/discord/channel/message";
import { RawChannel } from "../../../types/raw/RawChannel";
import { createNonce, omit } from "../../MiscUtils";
import { post, patch, del, get, put } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { MessageStore } from "../../../stores/index";
import { Overwrite } from "../../../types/discord/channel/overwrite";
import { RawMessage, RawUser } from "../../../types/raw";
import { RawInvite } from "../../../types/raw/RawInvite";
import { MessageRecord } from "../../../records";

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

export function sendMessage(message: SendableMessage, channel: string): Promise<RawMessage> {
    return post({url: Endpoints.CHANNEL_MESSAGES(channel), body: message}).then(res => res.body);
}

export function editChannel(channel: string, edits: GuildChannelModifications): Promise<void> {
    return patch({url: Endpoints.CHANNEL_INTERACT(channel), body: edits}) as any;
}

export function deleteChannel(channel: string): Promise<void> {
    return del({url: Endpoints.CHANNEL_INTERACT(channel)}) as any;
}

export type MessageFetchQuery = {limit?: number} & ({around?: string} | {before?: string} | {after?: string});

async function _fetchMessages(url: string, query?: any): Promise<Map<string, RawMessage>> {
    const messageLookup = await get({
        url,
        query,
    });
    const rawMessages: RawMessage[] = messageLookup.body;
    const messages: Map<string, RawMessage> = new Map();
    for (const message of rawMessages) {
        messages.set(message.id, message);
    }
    return messages;
}

export function fetchMessages(channel: string, query?: MessageFetchQuery): Promise<Map<string, RawMessage>> {
    return _fetchMessages(Endpoints.CHANNEL_MESSAGES(channel), query);
}

export function fetchMessage(channel: string, id: string): Promise<RawMessage | undefined> {
    return get({
        url: Endpoints.FETCH_MESSAGE(channel, id)
    }).then(res => res.body);
}

export function editOverwrite(channel: string, overwrite: Overwrite): Promise<void> {
    return put({url: Endpoints.EDIT_PERMISSIONS(channel, overwrite.id), body: omit(overwrite, ["id"])}) as any;
}

export function deleteOverwrite(channel: string, overwrite: string): Promise<void> {
    return del({url: Endpoints.EDIT_PERMISSIONS(channel, overwrite)}) as any;
}

export function getInvites(channel: string): Promise<RawInvite[]> {
    return get({url: Endpoints.CHANNEL_INVITES(channel)}).then(res => res.body);
}

export interface InviteOptions {
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
}

export function createInvite(channel: string, options: InviteOptions = {}): Promise<RawInvite> {
    return post({url: Endpoints.CHANNEL_INVITES(channel), body: options}).then(res => res.body);
}

export function deleteInvite(invite: string | RawInvite): Promise<void> {
    return del({url: Endpoints.MANAGE_INVITE(typeof invite === "string" ? invite : invite.code)}) as any;
}

export function typing(channel: string): Promise<void> {
    return post({url: Endpoints.TYPING(channel)}) as any;
}

export function getPinnedMessages(channel: string): Promise<Map<string, RawMessage>> {
    return _fetchMessages(Endpoints.CHANNEL_PINS(channel));
}

export function addPin(channel: string, message: string): Promise<void> {
    return put({url: Endpoints.MANAGE_PIN(channel, message)}) as any;
}

export function removePin(channel: string, message: string): Promise<void> {
    return del({url: Endpoints.MANAGE_PIN(channel, message)}) as any;
}

export function addDMRecipient(channel: string, recipient: string): Promise<void> {
    return put({url: Endpoints.DM_MANAGE_RECIPIENT(channel, recipient)}) as any;
}

export function removeDMRecipient(channel: string, recipient: string): Promise<void> {
    return del({url: Endpoints.DM_MANAGE_RECIPIENT(channel, recipient)}) as any;
}