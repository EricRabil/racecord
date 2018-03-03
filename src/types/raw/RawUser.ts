import { RawIntegration } from ".";

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

export interface RawConnection {
    id: string;
    name: string;
    type: string;
    revoked: boolean;
    integrations: RawIntegration[];
};