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

export type Action = BaseAction | MessageAction;

export interface BaseAction {
    type: ActionType;
    payload?: Payload;
    data?: any;
    [key: string]: any;
}

export interface MessageAction extends BaseAction {
    type: "MESSAGE_CREATE";
    payload: MessageCreatePayload;
    data: RawMessage | MessageRecord;
}