import { SendableMessage } from "../../../types/discord/channel/message";
import { RawChannel } from "../../../types/raw/RawChannel";
import { MessageRecord } from "../../../records/MessageRecord";
import { createNonce, omit } from "../../MiscUtils";
import { post, patch, del, get, put } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { MessageStore } from "../../../stores/index";
import { Overwrite } from "../../../types/discord/channel/overwrite";
import { ChannelRecord } from "../../../records";
import { RawMessage, RawUser } from "../../../types/raw";
import { InviteRecord } from "../../../records/InviteRecord";
import { RawInvite } from "../../../types/raw/RawInvite";

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
        post({url: Endpoints.CHANNEL_MESSAGES(channel), body: message});
        MessageStore.registerNonce(nonce, (messageRecord) => resolve(messageRecord));
    });
}

export function editChannel(channel: RawChannel, edits: GuildChannelModifications): Promise<void> {
    return patch({url: Endpoints.CHANNEL_INTERACT(channel), body: edits}) as any;
}

export function deleteChannel(channel: RawChannel): Promise<void> {
    return del({url: Endpoints.CHANNEL_INTERACT(channel)}) as any;
}

export type MessageFetchQuery = {limit?: number} & ({around?: string} | {before?: string} | {after?: string});

async function _fetchMessages(url: string, query?: any): Promise<Map<string, MessageRecord>> {
    const messageLookup = await get({
        url,
        query,
    });
    const rawMessages: RawMessage[] = messageLookup.body;
    const messages: Map<string, MessageRecord> = new Map();
    for (const message of rawMessages) {
        messages.set(message.id, new MessageRecord(message));
    }
    return messages;
}

export function fetchMessages(channel: RawChannel, query?: MessageFetchQuery): Promise<Map<string, MessageRecord>> {
    return _fetchMessages(Endpoints.CHANNEL_MESSAGES(channel), query);
}

export async function fetchMessage(channel: RawChannel, id: string): Promise<MessageRecord | undefined> {
    const messageLookup = await get({
        url: Endpoints.FETCH_MESSAGE(channel, id)
    });
    const rawMessage: RawMessage = messageLookup.body;
    if (!rawMessage) {
        return;
    }
    return new MessageRecord(rawMessage);
}

export function editOverwrite(channel: RawChannel, overwrite: Overwrite): Promise<void> {
    return put({url: Endpoints.EDIT_PERMISSIONS(channel as any, overwrite), body: omit(overwrite, ["id"])}) as any;
}

export function deleteOverwrite(channel: RawChannel, overwrite: Overwrite): Promise<void> {
    return del({url: Endpoints.EDIT_PERMISSIONS(channel, overwrite)}) as any;
}

export async function getInvites(channel: RawChannel): Promise<InviteRecord[]> {
    const rawInvites: RawInvite[] = (await get({url: Endpoints.CHANNEL_INVITES(channel)})).body;
    const invites: InviteRecord[] = [];
    for (const rawInvite of rawInvites) {
        invites.push(new InviteRecord(rawInvite));
    }
    return invites;
}

export interface InviteOptions {
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
}

export async function createInvite(channel: RawChannel, options: InviteOptions = {}): Promise<InviteRecord> {
    const {body} = await post({url: Endpoints.CHANNEL_INVITES(channel), body: options});
    return new InviteRecord(body);
}

export function deleteInvite(invite: string | RawInvite): Promise<void> {
    return del({url: Endpoints.MANAGE_INVITE(typeof invite === "string" ? invite : invite.code)}) as any;
}

export function typing(channel: RawChannel): Promise<void> {
    return post({url: Endpoints.TYPING(channel)}) as any;
}

export function getPinnedMessages(channel: RawChannel): Promise<Map<string, MessageRecord>> {
    return _fetchMessages(Endpoints.CHANNEL_PINS(channel));
}

export function addPin(channel: RawChannel, message: RawMessage): Promise<void> {
    return put({url: Endpoints.MANAGE_PIN(channel, message)}) as any;
}

export function removePin(channel: RawChannel, message: RawMessage): Promise<void> {
    return del({url: Endpoints.MANAGE_PIN(channel, message)}) as any;
}

export function addDMRecipient(channel: RawChannel, recipient: RawUser): Promise<void> {
    return put({url: Endpoints.DM_MANAGE_RECIPIENT(channel, recipient)}) as any;
}

export function removeDMRecipient(channel: RawChannel, recipient: RawUser): Promise<void> {
    return del({url: Endpoints.DM_MANAGE_RECIPIENT(channel, recipient)}) as any;
}