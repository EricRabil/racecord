import { CommandMiddleware, Argument, CommandArgument, MessageEvent, isRawType, StructuredArgument } from "../Command";
import { UserRecord, ChannelRecord, GuildMemberRecord, GuildRecord } from "../../records";
import { UserStore, ChannelStore, GuildStore } from "../../stores";
import { EmbedField } from "../../types/raw";

/**
 * Finds a record using a partial name or ID
 * @param list the list of records
 * @param scorer the scorer function
 */
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

/**
 * Default comparator for simple name checking
 * 
 * @param provided the provided entry
 * @param keyOverride an override for the name property
 */
const nameComparator: (provided: string, keyOverride?: string) => ((item: {[key: string]: any}) => number) = (provided, keyOverride = "name") => (item) => {
    let score = 0;

    console.log(keyOverride);
    console.log(item);

    if (provided === item[keyOverride]) {
        score += 10;
    }
    if (item[keyOverride].includes(provided)) {
        score += 3;
    }

    return score;
}

const trueKeywords: string[] = ["true", "yes", "1", "y", "t"];

/**
 * Parses a raw argument against a given definition, converts it to the expected property or returns null/undefined
 */
async function validate(arg: StructuredArgument & {_isCustomFunction?: boolean}, event: MessageEvent, provided: string): Promise<CommandArgument | null | undefined> {
    if (!provided) {
        if (!arg.optional) {
            return null;
        } else {
            return;
        }
    }
    const type = arg.type;
    const optional = arg.optional;
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
            return trueKeywords.includes(provided.toLowerCase());
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
    const args: StructuredArgument[] | undefined = command.args as StructuredArgument[] | undefined;
    const providedArgs = event.args as string[];
    if (!args) {
        next();
        return;
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (isRawType(arg)) {
            args[i] = {type: arg};
        }
    }

    const invalid: {[key: number]: StructuredArgument & {_isCustomFunction?: boolean}} = {};
    const parsedArguments: CommandArgument[] = [];

    /**
     * Actual argument parsing code, pass an argument index and definition
     * @param index the index
     * @param arg the definition
     */
    const parseArgument = async (index: number, arg: StructuredArgument) => {
        const provided = providedArgs[index];
        const fuzzy = isNaN(provided as any);
        if (!provided && arg.optional) {
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

    /**
     * Parses all remaining provided arguments against a definition. For infinite arguments.
     * @param startingIndex the starting point
     * @param arg the argument
     */
    const parseRemaining = async (startingIndex: number, arg: StructuredArgument) => {
        for (let i = startingIndex; i < providedArgs.length; i++) {
            parseArgument(i, arg);
        }
    }
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.infinite) {
            await parseRemaining(i, arg);
            break;
        }
        await parseArgument(i, arg);
    }

    event.args = parsedArguments;

    /**
     * Sends an error embed if we are not silently failing.
     */
    if ((!opts || !opts.silentFail) && Object.keys(invalid).length !== 0) {
        const fields: EmbedField[] = [];
        for (const index in invalid) {
            const item = invalid[index as any as number];
            if (!item) {
                continue;
            }
            let decoratedType = item._isCustomFunction ? "" : item.type.name;
            if (decoratedType.endsWith("Record")) {
                const recordIndex = decoratedType.indexOf("Record");
                decoratedType = decoratedType.substring(0, recordIndex);
            }
            const argumentName = `(Arg. #${(index as any * 1) + 1})${item.name ? ` ${item.name}` : ""}${decoratedType ? ` [${decoratedType}]` : ""}`;
            fields.push({name: argumentName, value: item.description || "\u200b", inline: false});
        }
        console.log(fields);
        await event.channel.sendMessage({embed: {color: 0xFF7777, description: "Sorry! Please make sure your arguments meet the below criteria", fields, title: "Invalid Arguments"}});
        return;
    }

    next();
};