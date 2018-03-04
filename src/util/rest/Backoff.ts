/**
 * @private
 * Used for graceful ratelimit handling
 */
export class Backoff {

    private fails: number = 0;
    private maximum: number;

    private _delay: number;
    private timeoutID: NodeJS.Timer;

    public constructor(private minimum: number = 500, maximum?: number) {
        this.maximum = maximum || minimum * 10;
        this._delay = this.minimum;
    }

    /**
     * Is this backoff already running
     */
    public get processing(): boolean {
        return this.timeoutID !== undefined;
    }

    /**
     * Initiates a backoff that will end in x milliseconds
     * @param func the callback
     * @param delay the delay, in ms
     */
    public delay(func: () => any, delay?: number): void {
        if (this.timeoutID) {
            throw new Error("Backoff is already in process");
        }
        if (!delay) {
            this.fails++;
            this._delay = Math.min(this._delay + (2 * this._delay), this.maximum);
        }
        this.timeoutID = setTimeout(() => {
            try {
                func();
            } finally {
                delete this.timeoutID;
            }
        }, delay || this._delay);
    }
}