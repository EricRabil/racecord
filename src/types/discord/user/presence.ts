export interface Presence {
    game: {
        name: string;
        type: number;
        url?: string | null;
        timestamps?: Array<{
            start?: number;
            end?: number;
        }>;
        application_id?: string;
        details?: string | null;
        state?: string | null;
        party?: {
            id?: string;
            size?: [number, number];
        };
        assets?: {
            large_image?: string;
            large_text?: string;
            small_image?: string;
            small_text?: string;
        };
    };
    status: "idle" | "dnd" | "online" | "offline";
    since: number;
    afk: boolean;
}