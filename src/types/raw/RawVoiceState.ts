export interface RawVoiceState {
    guild_id?: string;
    channel_id: string;
    user_id: string;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    suppress: boolean;
}