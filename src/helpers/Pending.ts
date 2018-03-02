import { Store } from "../types/structures/store";
import { Analytics } from "../util/Analytics";

export type Resolution<T> = (entity: T) => any;

type ResolverMap<T> = Map<string, Array<Resolution<T>>>;

export class Pending<T> {
    private resolvers: ResolverMap<T> = new Map();

    public enlist(id: string, resolver: Resolution<T>) {
        const resolverArray = this.resolvers.get(id);
        Analytics.debug("pending", `New resolver enlisted for ID ${id}`);
        if (resolverArray) {
            resolverArray.push(resolver);
        } else {
            this.resolvers.set(id, [resolver]);
        }
    }

    public async emit(id: string, entity: T) {
        const resolverArray = this.resolvers.get(id);
        if (!resolverArray) {
            Analytics.debug("pending", `No enlisted functions for ID ${id}`);
            return;
        }
        Analytics.debug("pending", `Resolving all enlisted functions for ID ${id}`);
        for (const resolver of resolverArray) {
            (async () => resolver(entity))();
        }
        this.resolvers.delete(id);
    }
}