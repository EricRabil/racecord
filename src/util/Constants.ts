export const Constants = {
    API_HOST: "https://discordapp.com/api/v6",
};

export const Endpoints = {
    CHANNEL_INTERACT: (id: string) => `/channels/${id}`,
    CHANNEL_MESSAGES: (id: string) => `/channels/${id}/messages`,
    FETCH_MESSAGE: (id: string, messageID: string) => `/channels/${id}/messages/${messageID}`,
    MODIFY_MESSAGE: (channel_id: string, id: string) => `/channels/${channel_id}/messages/${id}`,
    MESSAGE_REACT: (channel_id: string, id: string, user: string, emoji: string) => `/channels/${channel_id}/messages/${id}/reactions/${encodeURIComponent(emoji)}/${user}`,
    BULK_DELETE: (id: string) => `/channels/${id}/messages/bulk-delete`,
    EDIT_PERMISSIONS: (id: string, overwrite: string) => `/channels/${id}/permissions/${overwrite}`,
    CHANNEL_INVITES: (id: string) => `/channels/${id}/invites`,
    MANAGE_INVITE: (invite: string) => `/invite/${invite}`,
    TYPING: (channel: string) => `/channels/${channel}/typing`,
    CHANNEL_PINS: (channel: string) => `/channels/${channel}/pins`,
    MANAGE_PIN: (channel: string, message: string) => `/channels/${channel}/pins/${message}`,
    DM_MANAGE_RECIPIENT: (channel: string, user: string) => `/channels/${channel}/recipients/${user}`,
    GUILD_EMOJIS: (guild: string, emoji?: string) => `/guilds/${guild}/emojis${emoji ? `/${emoji}` : ""}`,
    GUILD_CREATE: `/guilds`,
    GUILD: (guild: string) => `/guilds/${guild}`,
    GUILD_CHANNELS: (guild: string) => `/guilds/${guild}/channels`,
    GUILD_MEMBER: (guild: string, member: string) => `/guilds/${guild}/members/${member}`,
    GUILD_MEMBERS: (guild: string) => `/guilds/${guild}/members`,
    SET_SELF_NICKNAME: (guild: string) => `/guilds/${guild}/members/@me/nick`,
    MEMBER_ROLE: (guild: string, member: string, role: string) => `/guilds/${guild}/members/${member}/roles/${role}`,
    GUILD_BANS: (guild: string) => `/guilds/${guild}/bans`,
    GUILD_BAN: (guild: string, user: string) => `/guilds/${guild}/bans/${user}`,
    GUILD_ROLES: (guild: string) => `/guilds/${guild}/roles`,
    GUILD_ROLE: (guild: string, role: string) => `/guilds/${guild}/roles/${role}`,
    GUILD_PRUNE: (guild: string) => `/guilds/${guild}/prune`,
    GUILD_REGIONS: (guild: string) => `/guilds/${guild}/regions`,
    GUILD_INVITES: (guild: string) => `/guilds/${guild}/invites`,
    GUILD_INTEGRATIONS: (guild: string) => `/guilds/${guild}/itegrations`,
    GUILD_INTEGRATION: (guild: string, integration: string) => `/guilds/${guild}/integrations/${integration}`,
    GUILD_SYNC_INTEGRATION: (guild: string, integration: string) => `/guilds/${guild}/integrations/${integration}/sync`,
    GUILD_EMBED: (guild: string) => `/guilds/${guild}/embed`,
    GUILD_VANITY_URL: (guild: string) => `/guilds/${guild}/vanity-url`,
    USER_INTERACT: (user: string) => `/users/${user}`
};

export const ChannelTypes = {
    DM: 1,
    GROUP_DM: 3,
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    CATEGORY: 4,
};
