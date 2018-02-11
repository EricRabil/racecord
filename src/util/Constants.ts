import { RawChannel } from "../types/raw/RawChannel";
import { RawMessage } from "../types/raw/RawMessage";

export const Constants = {
    API_HOST: "https://discordapp.com/api/v6",
};

export const Endpoints = {
    CHANNEL_INTERACT: ({id}: RawChannel) => `/channels/${id}`,
    SEND_MESSAGE: ({id}: RawChannel) => `/channels/${id}/messages`,
    MODIFY_MESSAGE: ({channel_id, id}: RawMessage) => `/channels/${channel_id}/messages/${id}`
};

export const ChannelTypes = {
    DM: 1,
    GROUP_DM: 3,
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    CATEGORY: 4,
};
