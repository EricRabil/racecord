import {RawEmoji} from "./RawEmoji";

export interface RawReaction {
    count: number;
    me: boolean;
    emoji: RawEmoji;
}