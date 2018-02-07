import {Dispatcher} from "./Dispatcher";

import {Action, ActionConsumer} from "../types/structures/action";
import {Store} from "../types/structures/store";

let initialized: boolean = false;

const loadStores = async () => {
    await Promise.all([
        import("../stores/AuthStore"),
    ]);
};

export class StoreTracker {

    private _stores: Store[] = [];
    private _eventConsumers: ActionConsumer[] = [];
    private registeredConsumers: string[] = [];

    public register(store: Store, events?: ActionConsumer): void {
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
        await Promise.all(this._stores.map(store => store.initialize()));
        this._eventConsumers.forEach(eventConsumer => {
            this.registeredConsumers.push(Dispatcher.register(eventConsumer));
        });
    }

    public async load(): Promise<void> {
        await loadStores();
    }

    public ready(handler: () => void): void {
        this.load().then(() => this.initialize()).then(() => handler());
    }

    public async destructure(): Promise<void> {
        if (!initialized) {
            return;
        }
        await Promise.all(this._stores.map(store => store.destructure()));
        this.registeredConsumers.forEach(consumer => Dispatcher.unregister(consumer));
    }

    public get stores(): Store[] {
        return this._stores;
    }
}

export const StoreManager = new StoreTracker();
