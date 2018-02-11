import {Action, ActionType, ActionTypes} from "../types/structures/action";
import { EventEmitter } from "events";

export class RacecordDispatcher {

    private listenerMap: {[key: string]: (action: Action) => any} = {};

    public async dispatch(action: Action) {
        for (const id in this.listenerMap) {
            (async () => this.listenerMap[id](action))();
        }
    }

    public register(listener: (action: Action) => any): string {
        const key = this.nextKey;
        this.listenerMap[key] = listener;
        return key;
    }

    public unregister(key: string): void {
        delete this.listenerMap[key];
    }

    private get nextKey(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private get listeners(): Array<(action: Action) => any> {
        return Object.values(this.listenerMap);
    }
}

export const Dispatcher = new RacecordDispatcher();

const intercepted: ActionType[] = [
    ActionTypes.CHANNEL_UPDATE,
    ActionTypes.CHANNEL_CREATE,
    ActionTypes.CHANNEL_DELETE,
    ActionTypes.GUILD_MEMBER_ADD,
    ActionTypes.GUILD_MEMBER_UPDATE,
    ActionTypes.GUILD_CREATE,
    ActionTypes.GUILD_UPDATE,
    ActionTypes.GUILD_DELETE,
    ActionTypes.MESSAGE_CREATE,
    ActionTypes.MESSAGE_UPDATE,
    ActionTypes.MESSAGE_DELETE
];

export const PublicDispatcher = new RacecordDispatcher();
Dispatcher.register(action => {
    if (intercepted.indexOf(action.type) !== -1) {
        return;
    }
    PublicDispatcher.dispatch(action);
});