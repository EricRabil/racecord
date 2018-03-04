import {Embed} from "../../raw/RawMessage";

export interface SendableMessage {
    content?: string;
    nonce?: string;
    tts?: boolean;
    embed?: Partial<Embed>;
}

export interface MessageEdit {
    content?: string;
    embed?: Partial<Embed>;
}