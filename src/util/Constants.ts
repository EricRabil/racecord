import { RawChannel } from "../types/raw/RawChannel";
import { RawMessage } from "../types/raw/RawMessage";
import { Overwrite } from "../types/discord/channel/overwrite";
import { RawUser } from "../types/raw";

export const Constants = {
    API_HOST: "https://discordapp.com/api/v6",
};

export const Endpoints = {
    CHANNEL_INTERACT: ({id}: RawChannel) => `/channels/${id}`,
    CHANNEL_MESSAGES: ({id}: RawChannel) => `/channels/${id}/messages`,
    FETCH_MESSAGE: ({id}: RawChannel, messageID: string) => `/channels/${id}/messages/${messageID}`,
    MODIFY_MESSAGE: ({channel_id, id}: RawMessage) => `/channels/${channel_id}/messages/${id}`,
    MESSAGE_REACT: ({channel_id, id}: RawMessage, user: string, emoji: string) => `/channels/${channel_id}/messages/${id}/reactions/${encodeURIComponent(emoji)}/${user}`,
    BULK_DELETE: ({id}: {id: string}) => `/channels/${id}/messages/bulk-delete`,
    EDIT_PERMISSIONS: ({id}: RawChannel, overwrite: Overwrite) => `/channels/${id}/permissions/${overwrite.id}`,
    CHANNEL_INVITES: ({id}: {id: string}) => `/channels/${id}/invites`,
    MANAGE_INVITE: (invite: string) => `/invite/${invite}`,
    TYPING: (channel: RawChannel) => `/channels/${channel.id}/typing`,
    CHANNEL_PINS: (channel: RawChannel) => `/channels/${channel.id}/pins`,
    MANAGE_PIN: (channel: RawChannel, message: RawMessage) => `/channels/${channel.id}/pins/${message.id}`,
    DM_MANAGE_RECIPIENT: (channel: RawChannel, user: RawUser) => `/channels/${channel.id}/recipients/${user.id}`
};

export const ChannelTypes = {
    DM: 1,
    GROUP_DM: 3,
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    CATEGORY: 4,
};
