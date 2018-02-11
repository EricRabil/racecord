import { Dispatcher } from "./Dispatcher";

export class AnalyticUtils {
    constructor() {
    }

    public debug(context: string, data: string) {
        Dispatcher.dispatch({type: "DEBUG", context, data});
    }
};

export const Analytics = new AnalyticUtils();