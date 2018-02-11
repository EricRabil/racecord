export interface RawUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
    mfa_enabled?: boolean;
    verified?: boolean;
    email?: string;
};