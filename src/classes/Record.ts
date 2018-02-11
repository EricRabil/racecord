import { Analytics } from "../util/Analytics";
import { readonly } from "../util/MiscUtils";

export class Record {
    /**
     * Merges new data into this record, useful for update events
     * 
     * @param data the data to merge
     */
    public merge(data: {[key: string]: any}): this {
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            if (!this.hasOwnProperty(keys[i])) {
                continue;
            }
            const key = keys[i];
            if ((this as any)[key] === data[key]) {
                continue;
            }
            (this as any)[key] = data[key];
        }
        return this;
    }

    /**
     * Converts the record to JSON
     */
    public toJSON(): any {
        return JSON.stringify(this);
    }

    /**
     * Converts the record to a raw record
     */
    public toRaw(): any {
        throw new Error("`toRaw` must be implemented by subclasses.");
    }

    /**
     * Merges an object into this record regardless of whether it already exists
     * 
     * @param data the data to merge
     * @param omit the keys to omit
     */
    protected assign(data: {[key: string]: any}, omit: string[] = []): this {
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (omit.indexOf(key) !== -1) {
                continue;
            }
            try {
                (this as any)[key] = data[key];
            } catch (e) {
                Analytics.debug("record", `Couldn't set key ${key} in record ${this.constructor.name}`);
            }
        }
        return this;
    }

    /**
     * Creates a read-only property with gracefully failing writes
     * 
     * The property will be read-only but will not throw an error when set.
     * 
     * @param key the key to flag as read-only
     * @param data the value to use, can be a function or a static property
     */
    protected readonly(key: string, data: any): this {
        readonly(this, key, data);
        return this;
    }
}