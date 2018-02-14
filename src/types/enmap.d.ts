declare class Enmap<K,V> {
    init(): void;
    validateName(): boolean;
    close(): void;
    set(key: K, value: V): Map<K,V>;
    setAsync(key: K, value: V): Map<K,V>;
    delete(key: K, bulk?: boolean): void;
    deleteAsync(key: K, bulk?: boolean): void;
    purge(): Promise<void>;
    array(): V[];
    keyArray(): K[];
    random(count?: number): V[];
    randomKey(count?: number): K[];
    findAll(prop: string, value: any): K[];
    find(prop: (value: any) => boolean | string, value?: any): K | undefined;
    exists(prop: string, value: any): boolean;
    filter(filter: (item: V) => boolean, thisArg?: any): Enmap<K,V>;
    filterArray(filter: (item: V) => boolean, thisArg?: any): V[];
    map<Y>(mapper: (item: V) => Y, thisArg?: any): Y[];
    some(some: (item: V) => boolean, thisArg?: any): boolean;
    every(every: (item: V) => boolean, thisArg?: any): boolean;
    reduce<Y>(reducer: (accumulator: Y, currentValue: V, currentKey: K, enmap: this) => Y, initialValue: Y): void;
    clone(): Enmap<K,V>;
    concat(...maps: Array<Enmap<K,V>>): Enmap<K,V>;
    deleteAll(): Promise<void>;
    equals(map: Enmap<K,V>): boolean;
    get(key: K): V | undefined;
}

declare module 'enmap' {
    export = Enmap;
}