import { InnerIdentifyPayload } from "../util/gateway/GatewayEvents";
import { platform } from "os";
import { GatewayConnection } from "./GatewayConnection";
import { Dispatcher } from "../util/Dispatcher";
import { ActionTypes } from "../types/structures/action";

export const Client = new (class Client {

    public gatewayConnection: GatewayConnection = new GatewayConnection();

    public connect(token: string | InnerIdentifyPayload): Promise<void> {
        const innerPayload: InnerIdentifyPayload = typeof token === "string" ? {
            token,
            compress: true,
            large_threshold: 100,
            properties: {
                $os: platform(),
                $browser: "racecord",
                $device: "racecord"
            }
        } : token;
        Dispatcher.dispatch({type: ActionTypes.SETTINGS_UPDATE, data: {token: innerPayload.token}});
        return new Promise((resolve, reject) => {
            this.gatewayConnection.refresh();
            this.gatewayConnection.once("identifiable", () => {
                this.gatewayConnection.send({op: 2, d: innerPayload});
            });
            this.gatewayConnection.once("ready", () => {
                resolve();
            });
        });
    }
})()