import { RawWebhook } from "../../../types/raw/RawWebhook";
import { post, get, patch, del } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";
import { Embed, RawAttachment, RawMessage } from "../../../types/raw";

export function createWebhook(channel: string, name: string, avatar?: string): Promise<RawWebhook> {
    return post({url: Endpoints.CHANNEL_WEBHOOKS(channel), body: {name, avatar}}).then(res => res.body);
}

export function getWebhooks(id: string, channel: boolean = true): Promise<RawWebhook[]> {
    return get({url: Endpoints[channel ? "CHANNEL_WEBHOOKS" : "GUILD_WEBHOOKS"](id)}).then(res => res.body);
}

export function getWebhook(id: string, token?: string): Promise<RawWebhook> {
    return get({url: Endpoints.WEBHOOK(id, token)}).then(res => res.body);
}

export interface WebhookEditRequest {
    name: string;
    avatar: string;
    channel_id: string;
}

export function editWebhook(id: string, data: WebhookEditRequest, token?: string): Promise<RawWebhook> {
    return patch({url: Endpoints.WEBHOOK(id, token), body: data}).then(res => res.body);
}

export function deleteWebhook(id: string, token?: string): Promise<void> {
    return del({url: Endpoints.WEBHOOK(id, token)}).then(res => res.body);
}

export interface WebhookExecuteRequest {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean;
    file?: RawAttachment;
    embeds?: Embed[];
}

export function executeWebhook(id: string, token: string, request: WebhookExecuteRequest, wait: boolean): Promise<RawMessage | undefined> {
    return post({url: Endpoints.WEBHOOK(id, token), body: request, query: {wait}}).then(res => res.body);
}