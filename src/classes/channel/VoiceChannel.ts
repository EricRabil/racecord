import {GuildChannel} from "./GuildChannel";

export class VoiceChannel extends GuildChannel {
    bitrate: number;
    user_limit: number;

    /**
     * Sets the bitrate of this voice channel
     * @param bitrate the new bitrate
     */
    public setBitrate(bitrate: number): Promise<void> {
        return this.edit({bitrate});
    }

    /**
     * Sets the user limit for this voice channel
     * @param user_limit the new user limit
     */
    public setUserLimit(user_limit: number): Promise<void> {
        return this.edit({user_limit});
    }
}