export interface Store<T> {
    initialize? (): Promise<void>;
    destructure? (): Promise<void>;
    /**
     * Pulls a cached record or retrieves it from REST
     * @param id the id of the object to lookup
     */
    findOrCreate(id: string): Promise<T | undefined>;
    /**
     * Waits for an object to be entered into the store
     * @param id the id to wait for
     */
    once(id: string): Promise<T>;
}
