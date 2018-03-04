import { Record } from "../classes/Record";
import { RawIntegration } from "../types/raw";

export class IntegrationRecord extends Record {
    public constructor(data: RawIntegration) {
        super();
        this.assign(data);
    }
}