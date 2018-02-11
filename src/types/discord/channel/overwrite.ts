export interface Overwrite {
    id: string;
    type: "role" | "member";
    allow: number;
    deny: number;
}