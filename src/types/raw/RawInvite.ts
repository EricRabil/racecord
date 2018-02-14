import { RawGuild, RawChannel } from ".";

export interface RawInvite {
    code: string;
    guild: Partial<RawGuild>;
    channel: Partial<RawChannel>;
}