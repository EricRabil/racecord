import { RawChannel } from "../types/raw/RawChannel";
import { RawMessage } from "../types/raw/RawMessage";

export const Constants = {
    API_HOST: "https://discordapp.com/api/v6",
};

export const Endpoints = {
    CHANNEL_INTERACT: ({id}: RawChannel) => `/channels/${id}`,
    CHANNEL_MESSAGES: ({id}: RawChannel) => `/channels/${id}/messages`,
    FETCH_MESSAGE: ({id}: RawChannel, messageID: string) => `/channels/${id}/messages/${messageID}`,
    MODIFY_MESSAGE: ({channel_id, id}: RawMessage) => `/channels/${channel_id}/messages/${id}`,
    MESSAGE_REACT: ({channel_id, id}: RawMessage, user: string, emoji: string) => `/channels/${channel_id}/messages/${id}/reactions/${encodeURIComponent(emoji)}/${user}`
};

export const ChannelTypes = {
    DM: 1,
    GROUP_DM: 3,
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    CATEGORY: 4,
};
