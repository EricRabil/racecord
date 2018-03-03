import { Record } from "../classes/Record";
import { RawMessage, Embed } from "../types/raw/RawMessage";
import { RawAttachment } from "../types/raw/RawAttachment";
import { RawReaction } from "../types/raw/RawReaction";
import { RawUser } from "../types/raw/RawUser";
import { UserRecord } from "./UserRecord";
import { UserStore } from "../stores/index";
import { ChannelRecord } from "./ChannelRecord";
import { ChannelStore } from "../stores/ChannelStore";
import { TextBasedChannel } from "../types/structures/channel/TextBasedChannel";
import { TextChannel } from "../classes/channel/TextChannel";
import { DMChannel, DMGroupChannel } from "../classes/channel/DMChannel";
import { MessageEdit } from "../types/discord/channel/message";
import { patch, del } from "../util/HTTPUtils";
import { Endpoints } from "../util/Constants";
import { deleteMessage, editMessage, reactToMessage, deleteOwnReaction, deleteReaction } from "../util/rest/actions/MessageActions";
import { RawEmoji } from "../types/raw";
import { GuildRecord, GuildMemberRecord } from ".";

export class MessageRecord extends Record implements RawMessage {
    id: string;
    channel_id: string;
    author: UserRecord;
    content: string;
    timestamp: string;
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: UserRecord[];
    mention_roles: string[];
    attachments: RawAttachment[];
    embeds: Embed[];
    reactions: RawReaction[];
    nonce?: string | null | undefined;
    pinned: boolean;
    webhook_id?: string | undefined;
    type: number;
    activity?: { type: number; party_id?: string | undefined; } | undefined;
    application?: { id: string; cover_image: string; description: string; icon: string; name: string; } | undefined;
    deleted: boolean = false;
    channel: TextChannel | DMChannel | DMGroupChannel;

    guild?: GuildRecord;
    member?: GuildMemberRecord;

    public constructor(message: RawMessage) {
        super();
        this.assign(message);
        this.readonly("channel_id", this.channel_id);
        this.readonly("id", this.id);
        this.readonly("author", () => UserStore.getUser(message.author.id));
        this.readonly("type", this.type);
        this.readonly("channel", () => ChannelStore.channels.get(message.channel_id));
        this.readonly("guild", () => this.channel.guild);
        this.readonly("member", () => this.guild && this.guild.getMember(message.author.id));
    }

    /**
     * Edits a message
     * 
     * @param edits the edits to apply
     */
    public edit(edits: MessageEdit) {
        return editMessage(edits, this);
    }

    /**
     * Deletes a message
     */
    public delete() {
        return deleteMessage(this);
    }

    /**
     * Adds a reaction to a message
     * 
     * @param emoji the emoji to react with
     */
    public react(emoji: RawEmoji | string) {
        return reactToMessage(this, emoji);
    }

    /**
     * Removes the user's reaction from the message
     * 
     * @param emoji the emoji to remove
     */
    public removeOwnReaction(emoji: RawEmoji | string) {
        return deleteOwnReaction(this, emoji);
    }

    /**
     * Removes another user's reaction from the message
     * 
     * @param user the user that reacted
     * @param emoji the emoji to remove
     */
    public removeReaction(user: RawUser | string, emoji: RawEmoji | string) {
        return deleteReaction(this, typeof user === "string" ? user : user.id, emoji);
    }

    public pin(): Promise<void> {
        return this.channel.pin(this);
    }

    public unpin(): Promise<void> {
        return this.channel.unpin(this);
    }
}