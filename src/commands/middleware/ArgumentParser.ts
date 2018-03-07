import { CommandMiddleware, Argument, CommandArgument, MessageEvent, isRawType } from "../Command";
import { UserRecord, ChannelRecord, GuildMemberRecord, GuildRecord } from "../../records";
import { UserStore, ChannelStore, GuildStore } from "../../stores";
import { EmbedField } from "../../types/raw";

const findFuzzy: <T>(list: T[], scorer: (item: T) => number) => Promise<T | undefined> = async (list, scorer) => {
    const scores: {[key: number]: number} = {};
    for (let i = 0; i < list.length; i++) {
        const score = scorer(list[i]);
        if (score > 0) {
            scores[i] = score;
        }
    }
    const keys = Object.keys(scores);
    const highestIndex = keys.sort(function(a,b){return scores[a as any] - scores[b as any]})[keys.length - 1];
    return list[highestIndex as any];
};

const nameComparator: (provided: string, keyOverride?: string) => ((item: {[key: string]: any}) => number) = provided => (item, keyOverride = "name") => {
    let score = 0;

    if (provided === item[keyOverride]) {
        score += 10;
    }
    if (item[keyOverride].includes(provided)) {
        score += 3;
    }

    return score;
}

async function validate(arg: Argument & {_isCustomFunction?: boolean}, event: MessageEvent, provided: string): Promise<CommandArgument | null | undefined> {
    const type = isRawType(arg) ? arg : arg.type;
    const optional = isRawType(arg) ? false : arg.optional;
    const fuzzy = isNaN(provided as any);
    arg._isCustomFunction = false;
    switch (type) {
        case String:
            return provided;
        case Number:
            if (fuzzy) {
                return null;
            }
            return (provided as any) * 1;
        case Boolean:
            return Boolean(provided);
        case UserRecord:
            let user: UserRecord | undefined;
            if (fuzzy) {
                user = await findFuzzy(Array.from(UserStore.users.values()), nameComparator(provided, "username"));
            } else {
                user = UserStore.getUser(provided);
            }
            if (!user) {
                return null;
            }
            return user;
        case ChannelRecord:
            if (!event.guild) {
                if (optional) {
                    return undefined;
                }
                return null;
            }
            let channel: ChannelRecord | undefined;
            if (fuzzy) {
                channel = await findFuzzy(event.guild.channels, nameComparator(provided));
            } else {
                channel = ChannelStore.channels.get(provided);
            }
            if (!channel) {
                return null;
            }
            return channel;
        case GuildMemberRecord:
            if (!event.guild) {
                if (optional) {
                    return undefined;
                }
                return null;
            }
            let guildMember: GuildMemberRecord | undefined;
            if (fuzzy) {
                guildMember = await findFuzzy(event.guild.members, item => {
                    let score: number = 0;
                    if (provided === item.user.username as string) {
                        score += 10;
                    }
                    if ((item.user.username as string).includes(provided)) {
                        score += 3;
                    }

                    if (item.nick) {
                        if (provided === item.nick) {
                            score += 2;
                        }
                        if ((item.nick as string).includes(provided)) {
                            score += 1;
                        }
                    }

                    return score;
                });
            } else {
                guildMember = event.guild.membersCollection.get(provided);
            }
            if (!guildMember) {
                return null;
            }
            return guildMember;
        case GuildRecord:
            let guild: GuildRecord | undefined;
            if (fuzzy) {
                guild = await findFuzzy(Array.from(GuildStore.guilds.values()), nameComparator(provided));
            } else {
                guild = GuildStore.guilds.get(provided);
            }
            if (!guild) {
                return null;
            }
            return guild;
        default:
            arg._isCustomFunction = true;
            if (!(type as any as (item: string) => boolean)(provided)) {
                return null;
            }
            return provided;
    }
}

/**
 * Implementation of the arguments API
 * 
 * @param opts specify whether imparsable arguments should silently fail or should block command execution (useful for optional object retrieval)
 */
export const ArgumentParser: (opts?: {silentFail?: boolean}) => CommandMiddleware = (opts) => async (event, command, next) => {
    const {args} = command;
    const providedArgs = event.args as string[];
    if (!args) {
        next();
        return;
    }

    const invalid: {[key: number]: Argument & {_isCustomFunction?: boolean}} = {};
    const parsedArguments: CommandArgument[] = [];

    const parseArgument = async (index: number, arg: Argument) => {
        const provided = providedArgs[index];
        const fuzzy = isNaN(provided as any);
        if (!provided && !(isRawType(arg) ? false : arg.optional)) {
            invalid[index] = arg;
            return;
        }

        const validated = await validate(arg, event, provided);
        if (validated === null) {
            invalid[index] = arg;
        } else if (validated === undefined) {
            return;
        } else {
            parsedArguments[index] = validated;
        }
    }

    const parseRemaining = async (startingIndex: number, arg: Argument) => {
        for (let i = startingIndex; i < args.length; i++) {
            parseArgument(i, arg);
        }
    }
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (isRawType(arg) ? false : arg.infinite) {
            await parseRemaining(i, arg);
            break;
        }
        parseArgument(i, arg);
    }

    event.args = parsedArguments;

    if ((!opts || !opts.silentFail) && Object.keys(invalid).length !== 0) {
        const fields: EmbedField[] = [];
        for (const index in invalid) {
            const item = invalid[index as any as number];
            let decoratedType = item._isCustomFunction ? "" : isRawType(item) ? item.name : item.type.name;
            if (decoratedType.endsWith("Record")) {
                const recordIndex = decoratedType.indexOf("Record");
                decoratedType = decoratedType.substring(0, recordIndex);
            }
            const argumentName = `(Arg. #${index}) ${item.name ? item.name : "Untitled"}${decoratedType ? `: ${decoratedType}` : ""}`;
            fields.push({name: argumentName, value: isRawType(item) ? "" : item.description, inline: true});
        }
        return;
    }

    next();
};