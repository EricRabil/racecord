import { Store } from "../types/structures/store";
import { StoreManager } from "../util/StoreManager";
import { ActionConsumer } from "../types/structures/action";

let accountToken: string = null as any;

const handleLogin: ActionConsumer = ({token}) => accountToken = token;

export const AuthStore = new class implements Store {
    public async initialize(): Promise<void> {
    }
    public async destructure(): Promise<void> {
    }

    public get token(): string {
        return accountToken;
    }
}();

StoreManager.register(AuthStore, action => {
    switch (action.type) {
        case "LOGIN_SUCCESS":
            handleLogin(action);
        default:
            return;
    }
});
