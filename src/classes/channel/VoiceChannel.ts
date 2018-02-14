import {GuildChannel} from "./GuildChannel";

export class VoiceChannel extends GuildChannel {
    bitrate: number;
    user_limit: number;

    public setBitrate(bitrate: number): Promise<void> {
        return this.edit({bitrate});
    }

    public setUserLimit(user_limit: number): Promise<void> {
        return this.edit({user_limit});
    }
}