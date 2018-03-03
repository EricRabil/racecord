import { RawVoiceRegion } from "../../../types/raw";
import { get } from "../../HTTPUtils";
import { Endpoints } from "../../Constants";

export function getVoiceRegions(): Promise<RawVoiceRegion[]> {
    return get({url: Endpoints.VOICE_REGIONS}).then(res => res.body);
}