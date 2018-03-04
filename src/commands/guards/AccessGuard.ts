import { Embed } from "../../types/raw";
import { MessageEvent, CommandHandler } from "../Commander";
import { GuildStore } from "../../stores";

const fancyMap: {[key: string]: string} = {
    permission: "Permission",
    role: "Role",
    userID: "User ID",
    channel: "Channel",
    guild: "Guild",
    hasGuild: "Is In Guild"
}

export type PermissionSource = "permission" | "role" | "userID" | "channel" | "guild" | "hasGuild";

export interface PermissionGranter {
    type: PermissionSource,
    value: string;
}

/**
 * Sends an embed depicting an access error
 * @param message the message to build around
 * @param granters the qualifiers for access
 */
async function sendErrorDepiction(message: MessageEvent, granters?: PermissionGranter[]) {
    const embed: Embed = {};
    embed.title = "Missing Access";
    embed.color = 0xFF7777;
    embed.fields = [];
    let description: string = `You do not have access to use \`${message.command}\``;
    if (granters && granters.length > 0) {
        description += `\nThis command is accessible to users that meet any of the following:`;
        let hasUserFlag: boolean = false;
        for (const granter of granters) {
            if (embed.fields && embed.fields.length >= 19) {
                break;
            }
            if (granter.type === "userID") {
                if (hasUserFlag) {
                    continue;
                }
                hasUserFlag = true;
                embed.fields.push({name: "User Whitelist", value: "❌ This command has a user-whitelist. Ask about being whitelisted."});
                continue;
            }
            let value = granter.value;
            if (granter.type === "role") {
                if (!message.guild) {
                    continue;
                }
                const role = message.guild.roleMap.get(value);
                if (!role) {
                    continue;
                }
                value = `Missing \`${role.name}\` role`;
            } else if (granter.type === "channel") {
                if (!message.guild) {
                    continue;
                }
                const channel = message.guild.channelsMapped.get(value);
                if (!channel) {
                    continue;
                }
                value = `Not in \`${channel.name}\` channel`;
            } else if (granter.type === "guild" || granter.type === "hasGuild") {
                const guild = GuildStore.guilds.get(value);
                if (!guild) {
                    continue;
                }
                value = `Not in \`${guild.name}\` guild`;
            } else if (granter.type === "permission") {
                value = `Missing \`${value}\` permission`;
            }
            embed.fields.push({name: fancyMap[granter.type], value: `❌ ${value}`, inline: true});
        }
    }
    embed.description = description;
    await message.reply("", {embed});
}

/**
 * Creates traditional permission qualifiers from an array of IDs
 * @param source the qualifier type
 * @param values the qualifiers
 */
export function translateSources(source: PermissionSource, values: string[]): PermissionGranter[] {
    const granters: PermissionGranter[] = [];
    for (const value of values) {
        granters.push({
            type: source,
            value
        });
    }
    return granters;
}

/**
 * Lowest-level permission guard, allows the user to continue if they meet any of the given qualifiers
 * @param granters the qualifiers
 */
export const PermissionGuard: (granters: PermissionGranter[]) => CommandHandler = granters => async (message, next) => {
    let verified: boolean = false;
    for (const granter of granters) {
        if (verified) {
            break;
        }
        switch (granter.type) {
            case "permission":
                break;
            case "role":
                if (!message.member) {
                    break;
                }
                if (message.member.roleMap.has(granter.value)) {
                    verified = true;
                }
                break;
            case "userID":
                if (message.user.id === granter.value) {
                    verified = true;
                }
                break;
            case "channel":
                if (message.channel.id === granter.value) {
                    verified = true;
                }
                break;
            case "guild":
                if (message.guild && message.guild.id === granter.value) {
                    verified = true;
                }
                break;
            case "hasGuild":
                const guild = GuildStore.guilds.get(granter.value);
                if (!guild) {
                    break;
                }
                if (guild.membersCollection.has(message.user.id)) {
                    verified = true;
                }
                break;
        }
    }
    if (!verified) {
        await sendErrorDepiction(message, granters);
        return;
    }
    next();
};

/**
 * Guard for only granting access to given roles
 * @param roles the roles that qualify
 */
export const RoleGuard: (roles: string[]) => CommandHandler = roles => PermissionGuard(translateSources("role", roles));

/**
 * Guard for only granting access to permission-nodes
 * @param permissions the permission-nodes that qualify
 */
export const PermissionNodeGuard: (permissions: string[]) => CommandHandler = permissions => PermissionGuard(translateSources("permission", permissions));

/**
 * Guard for only granting access to user IDs
 * @param users the user IDs that qualify
 */
export const UserGuard: (users: string[]) => CommandHandler = users => PermissionGuard(translateSources("userID", users));

/**
 * Guard for only granting access to given channels
 * @param channels the channel IDs that qualify
 */
export const ChannelGuard: (channels: string[]) => CommandHandler = channels => PermissionGuard(translateSources("channel", channels));

/**
 * Guard for only granting access to given guilds
 * @param guilds the guild IDs that qualify
 */
export const GuildGuard: (guilds: string[]) => CommandHandler = guilds => PermissionGuard(translateSources("guild", guilds));

/**
 * Guard for only granting access to those which are members of a given guild
 * @param guilds the guild IDs that qualify
 */
export const GuildMemberGuard: (guilds: string[]) => CommandHandler = guilds => PermissionGuard(translateSources("hasGuild", guilds));