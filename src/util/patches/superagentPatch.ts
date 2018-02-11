import * as superagent from "superagent";
import { Constants } from "../Constants";
import { SettingsStore } from "../../stores/SettingsStore";

const originalEnd = ((superagent as any).Request.prototype as superagent.Request).end;
((superagent as any).Request.prototype as superagent.Request).end = function(...args: any[]) {
    const url = (this as any).url as string;
    if (url[0] === "/") {
        (this as any).url = Constants.API_HOST + url;
        const header = (this as any).header as {[key: string]: any};
        const token = SettingsStore.token;
        if (!("Authorization" in header) && !("authorization" in header) && token) {
            this.set("Authorization", `Bot ${token}`);
        }
    }
    return originalEnd.apply(this, arguments);
};
