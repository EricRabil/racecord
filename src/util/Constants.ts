import { RawChannel } from "../types/raw/RawChannel";
import { RawMessage } from "../types/raw/RawMessage";

export const Constants = {
    API_HOST: "https://discordapp.com/api/v6",
};

export const Endpoints = {
    CHANNEL_INTERACT: ({id}: RawChannel) => `/channels/${id}`,
    CHANNEL_MESSAGES: ({id}: RawChannel) => `/channels/${id}/messages`,
    FETCH_MESSAGE: ({id}: RawChannel, messageID: string) => `/channels/${id}/messages/${messageID}`,
};

export const ChannelTypes = {
    DM: 1,
    GROUP_DM: 3,
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    CATEGORY: 4,
};
