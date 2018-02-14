import * as Long from "long";
import { Analytics } from "./Analytics";
import * as repl from "repl";

export function reverseObject(object: {[key: string]: any}): any {
    const obj: {[key: string]: any} = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        obj[object[key]] = key;
    }
    return obj;
}

export function readonly(instance: any, key: string, data: any): void {
    if (typeof data === "function") {
        Object.defineProperty(instance, key, {
            get: data,
            set() {
                Analytics.debug("internal-data-mgmt", `Failed to set ${key} because it is read-only.`);
            }
        });
    } else {
        Object.defineProperty(instance, key, {
            get() {return data;},
            set() {
                Analytics.debug("internal-data-mgmt", `Failed to set ${key} because it is read-only.`);
            }
        });
    }
}

export function createNonce() {
    return Long.fromNumber(Date.now()).subtract(1420070400000).shiftLeft(22).toString();
}

export function omit<K>(object: K, keys: string[]): Partial<K> {
    const omitted: {[key: string]: any} = {};
    const objectKeys = Object.keys(object);
    for (const objectKey of objectKeys) {
        if (keys.includes(objectKey)) {
            continue;
        }
        omitted[objectKey] = (object as any)[objectKey];
    }
    return (omitted as any);
}