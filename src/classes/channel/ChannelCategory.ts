import { GuildChannel } from "./GuildChannel";
import { Overwrite } from "../../types/discord/channel/overwrite";

export class ChannelCategory extends GuildChannel {
    parent_id: null;
    type: 4;
}