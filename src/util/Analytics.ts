import { Dispatcher } from "./Dispatcher";

/** Used for debugging within the library */
export class AnalyticUtils {
    constructor() {
    }

    /**
     * Make a debug entry
     * @param context the context
     * @param data the data
     */
    public debug(context: string, data: string) {
        Dispatcher.dispatch({type: "DEBUG", context, data});
    }
};

export const Analytics = new AnalyticUtils();