import {GuildChannel} from "./GuildChannel";

export class VoiceChannel extends GuildChannel {
    bitrate: number;
    user_limit: number;
}