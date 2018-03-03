import { RawInvite } from "../../../types/raw/RawInvite";
import { get, del } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";

export function getInvite(code: string): Promise<RawInvite> {
    return get({url: Endpoints.MANAGE_INVITE(code)}).then(res => res.body);
}

export function deleteInvite(code: string): Promise<RawInvite> {
    return del({url: Endpoints.MANAGE_INVITE(code)}).then(res => res.body);
}
