import keyMirror = require("keymirror");
import { GatewayEvents, DispatchEvents, Payload, MessageCreatePayload } from "../../util/gateway/GatewayEvents";
import { RawMessage } from "../raw";
import { MessageRecord } from "../../records";

export const ActionTypes = keyMirror({
    DEBUG: null,
    SETTINGS_UPDATE: null,

    ...GatewayEvents,
    ...DispatchEvents
});

export type ActionType = keyof typeof ActionTypes;

export type ActionConsumer = (action: Action) => any;

export type Action = BaseAction;

export interface RawAction {
    type: string;
    data?: any;
}

export interface BaseAction extends RawAction {
    type: ActionType;
    /** Raw action payload, if coming from the gateway */
    payload?: Payload;
    /** Data supplied by the action */
    data?: any;
    [key: string]: any;
}
