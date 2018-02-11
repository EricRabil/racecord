/**
 * Backoff spec
 * 
 * Passes a minimum wait time, and an optional maximum wait time to the constructor. If the maximum is ommitted, it is the minimum wait time multiplied by ten
 * 
 * The method called when an API request bounces does the following:
 * (callback) -> 
 *    Increment fail count
 *    Computed delay offset is the current delay times two
 *    Set the current delay to either the maximum timeout or the delay with the offset, whichever one is smaller
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

    public get processing(): boolean {
        return this.timeoutID !== undefined;
    }

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