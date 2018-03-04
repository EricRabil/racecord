import { RawUser, RawGuild, RawChannel, RawIntegration, RawConnection } from "../../../types/raw";
import { get, patch, del, post } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";

export function getUser(id: string): Promise<RawUser> {
    return get({url: Endpoints.USER_INTERACT(id)}).then(res => res.body);
}

export interface ModifyUserRequest {
    username: string;
    avatar: string;
}

export function editUser(id: string, edits: ModifyUserRequest): Promise<RawUser> {
    return patch({url: Endpoints.USER_INTERACT(id), body: edits}).then(res => res.body);
}

export function getGuilds(id: string): Promise<RawGuild[]> {
    return get({url: Endpoints.USER_GUILDS(id)}).then(res => res.body);
}

export function leaveGuild(user: string, guild: string): Promise<void> {
    return del({url: Endpoints.USER_GUILD(user, guild)}) as Promise<any>;
}

export function getDirectMessages(user: string): Promise<RawChannel[]> {
    return get({url: Endpoints.USER_DIRECT_MESSAGES(user)}).then(res => res.body);
}

export function createDirectMessage(user: string, recipient_id: string): Promise<RawChannel> {
    return post({url: Endpoints.USER_DIRECT_MESSAGES(user), body: {recipient_id}}).then(res => res.body);
}

export function createGroupDM(user: string, access_tokens: string[], nicks: {[key: string]: string}): Promise<RawChannel> {
    return post({url: Endpoints.USER_DIRECT_MESSAGES(user), body: {access_tokens, nicks}}).then(res => res.body);
}

export function getConnections(user: string): Promise<RawConnection[]> {
    return get({url: Endpoints.USER_CONNECTIONS(user)}).then(res => res.body);
}