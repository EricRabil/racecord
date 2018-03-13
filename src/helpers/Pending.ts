import { Store } from "../types/structures/store";
import { Analytics } from "../util/Analytics";

export type Resolution<T> = (entity: T) => any;

type ResolverMap<T> = Map<string, Array<Resolution<T>>>;

/**
 * @private
 * A simple class for waiting for objects that meet a given criteria
 */
export class Pending<T> {
    private resolvers: ResolverMap<T> = new Map();

    /**
     * "Enlists" a callback function that is waiting for the provided criteria
     * @param id the criteria for resolution
     * @param resolver the callback
     */
    public enlist(id: string, resolver: Resolution<T>) {
        const resolverArray = this.resolvers.get(id);
        Analytics.debug("pending", `New resolver enlisted for ID ${id}`);
        if (resolverArray) {
            resolverArray.push(resolver);
        } else {
            this.resolvers.set(id, [resolver]);
        }
    }

    /**
     * Resolves the callbacks enlisted to the given criteria
     * @param id the criteria for resolution
     * @param entity the entity to resolve
     */
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