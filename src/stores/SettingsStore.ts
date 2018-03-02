import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionTypes } from "../types/structures/action";
import { Dispatcher } from "../util/Dispatcher";

const settings = {
    preserveDeletedMessages: false,
    token: null
};

type Settings = typeof settings;
type PartialSettings = Partial<Settings>;

export const SettingsStore = new class {
    public get preserveDeletedMessages(): boolean {
        return settings.preserveDeletedMessages;
    }

    /**
     * Returns the current token, or none if we are not authenticated.
     */
    public get token(): string | null {
        return settings.token;
    }
}

async function merge(newSettings: PartialSettings) {
    for (const key in newSettings) {
        (settings as any)[key] = (newSettings as any)[key];
    }
}

Dispatcher.register(action => {
    switch (action.type) {
        case ActionTypes.SETTINGS_UPDATE:
            merge(action.data);
            break;
    }
});