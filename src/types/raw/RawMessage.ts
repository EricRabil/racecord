import { RawUser } from "./RawUser";
import { RawAttachment } from "./RawAttachment";
import { RawReaction } from "./RawReaction";

export interface RawMessage {
    id: string;
    channel_id: string;
    author: RawUser;
    content: string;
    timestamp: string;
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: RawUser[];
    mention_roles: string[];
    attachments: RawAttachment[];
    embeds: Embed[];
    reactions?: RawReaction[];
    nonce?: string | null;
    pinned: boolean;
    webhook_id?: string;
    type: number;
    activity?: {
        type: number;
        party_id?: string;
    };
    application?: {
        id: string;
        cover_image: string;
        description: string;
        icon: string;
        name: string;
    };
}

export interface EmbedAsset {
    url: string;
    height: number;
    width: number;
}

export interface EmbedImage extends EmbedAsset {
    proxy_url: string;
}

export interface EmbedIcon {
    icon_url: string;
    proxy_icon_url: string;
}

export interface EmbedField {
    name: string;
    value: string;
    inline: boolean;
}

export interface Embed {
    title: string;
    type: "rich";
    description: string;
    url: string;
    timestamp: string;
    color: number;
    footer: {
        text: string;
        icon_url: string;
        proxy_icon_url: string;
    };
    image: EmbedImage;
    thumbnail: EmbedImage;
    video: EmbedAsset;
    provider: {
        name: string;
        url: string;
    };
    author: EmbedIcon & {
        url: string;
        name: string;
    };
    fields: EmbedField[];
}