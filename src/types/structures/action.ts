import keyMirror = require("keymirror");

export const ActionTypes = keyMirror({
    LOGGING_IN: null,
    LOGIN_FAILURE: null,
    LOGIN_SUCCESS: null,

    MESSAGE_CREATE: null,
});

export type ActionType = keyof typeof ActionTypes;

export type ActionConsumer = (action: Action) => any;

export interface Action {
    type: ActionType;
    [key: string]: any;
}
