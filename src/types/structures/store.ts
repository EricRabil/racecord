export interface Store<T> {
    initialize? (): Promise<void>;
    destructure? (): Promise<void>;
    findOrCreate(id: string): Promise<T | undefined>;
    once(id: string): Promise<T>;
}
