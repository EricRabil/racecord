import {Action, ActionType, ActionTypes} from "../types/structures/action";
import { EventEmitter } from "events";

/**
 * A very lightweight event system, used by internal components
 * 
 * This dispatching system is 100% asynchronous. Multiple events can be dispatched at the same time.
 * */
export class RacecordDispatcher {

    /**
     * A map of unique IDs to listeners
     */
    private listenerMap: {[key: string]: (action: Action) => any} = {};

    /**
     * Dispatch an event to all listeners
     * @param action the action to dispatch
     */
    public async dispatch(action: Action) {
        for (const id in this.listenerMap) {
            (async () => this.listenerMap[id](action))();
        }
    }

    /**
     * Registers a listener with this dispatcher
     * @param listener the listener to register
     * @returns the unique ID if you plan on de-registering later
     */
    public register(listener: (action: Action) => any): string {
        const key = this.nextKey;
        this.listenerMap[key] = listener;
        return key;
    }

    /**
     * Deregisters a listener using the unique ID registered previously
     * @param key the key to deregister
     */
    public unregister(key: string): void {
        delete this.listenerMap[key];
    }

    /**
     * The next unique key to use
     */
    private get nextKey(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * An array of listeners
     */
    private get listeners(): Array<(action: Action) => any> {
        return Object.values(this.listenerMap);
    }
}

/**
 * The internal dispatcher - raw gateway events will be dispatched here
 * */
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

/**
 * The public dispatcher - Racecord will dispatch gateway events here but with records instead of rawtypes
 */
export const PublicDispatcher = new RacecordDispatcher();
Dispatcher.register(action => {
    if (intercepted.indexOf(action.type) !== -1) {
        return;
    }
    PublicDispatcher.dispatch(action);
});