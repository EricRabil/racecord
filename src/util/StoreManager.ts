import {Dispatcher} from "./Dispatcher";

import {Action, ActionConsumer, ActionTypes} from "../types/structures/action";
import {Store} from "../types/structures/store";
import { ReadyPayload } from "./gateway/GatewayEvents";

let initialized: boolean = false;

Dispatcher.register((action) => {
    switch (action.type) {
        case ActionTypes.HELLO:
            StoreManager.initialize();
            break;
    }
})

/** Tracks and dispatches to stores */
export class StoreTracker {

    private _stores: Store<any>[] = [];
    private _eventConsumers: ActionConsumer[] = [];
    private registeredConsumers: string[] = [];

    public register(store: Store<any>, events?: ActionConsumer): void {
        this._stores.push(store);
        if (events) {
            this._eventConsumers.push(events);
        }
    }

    public async initialize(): Promise<void> {
        if (initialized) {
            return;
        }
        initialized = true;
        await Promise.all(this._stores.map(store => store && store.initialize && store.initialize()));
        this._eventConsumers.forEach(eventConsumer => {
            this.registeredConsumers.push(Dispatcher.register(eventConsumer));
        });
    }

    public async destructure(): Promise<void> {
        if (!initialized) {
            return;
        }
        await Promise.all(this._stores.map(store => store.destructure && store.destructure()));
        this.registeredConsumers.forEach(consumer => Dispatcher.unregister(consumer));
    }

    public get stores(): Store<any>[] {
        return this._stores;
    }
}

export const StoreManager = new StoreTracker();
import "../stores";