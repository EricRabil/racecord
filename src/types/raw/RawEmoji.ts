import { RawRole } from "./RawRole";
import { RawUser } from "./RawUser";

export interface RawEmoji {
    id: string | null;
    name: string;
    roles?: RawRole[];
    user?: RawUser[];
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
}