import * as superagent from "superagent";
import "./patches/superagentPatch";
import { Backoff } from "./rest/Backoff";

/** The request method */
export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'del';

/** Any options provided for carrying out the request */
export interface HTTPRequest {
    url: string,
    query?: {[key: string]: any} | string,
    body?: any,
    headers?: {[key: string]: any},
    backoff?: Backoff,
    retried?: number,
    retries?: number,
};

/**
 * Represents a response from the server
 */
export interface FulfilledRequest {
    header: any;
    body: any;
    status: number;
}

/**
 * @private
 * @param method the request method, GET, POST, PUT, PATCH or DEL
 * @param opts the options
 * @param resolveOverride whether to override the resolve function for this
 * @param rejectOverride whether to override the reject function for this
 */
export function sendRequest(method: HTTPMethod, opts: HTTPRequest, resolveOverride?: () => void, rejectOverride?: () => void): Promise<FulfilledRequest> {
    return new Promise((resolve, reject) => {
        resolve = resolveOverride || resolve;
        reject = rejectOverride || reject;
        const request = superagent[method](opts.url);
        if (opts.query) {
            request.query(opts.query);
        }
        if (opts.body) {
            request.send(opts.body);
        }
        if (opts.headers) {
            request.set(opts.headers);
        }
        if (opts.retried) {
            request.set('X-Failed-Requests', `${opts.retried}`);
        }

        const retry = (delay?: number) => {
            opts.backoff = opts.backoff || new Backoff();
            if (opts.backoff.processing) {
                return;
            }
            opts.retried = 0;
            opts.backoff.delay(() => sendRequest(method, opts, resolve, reject), delay);
        }

        const canRetry = () => opts.retries !== undefined && opts.retries !== null && opts.retries-- > 0;

        request.end((err, res) => {
            if (err || res.status >= 500) {
                res = res && res.body || err.response;
                if (res.status === 429) {
                    retry(res.body.retry_after);
                    return;
                }
                canRetry() ? retry() : reject(res);
                return;
            }
            const complete = res.ok ? resolve : reject;
            complete({
                header: res.header,
                body: res.body,
                status: res.status,
            });
        });
    });
}

// export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'del';

export const get = (opts: HTTPRequest) => sendRequest("get", opts);
export const post = (opts: HTTPRequest) => sendRequest("post", opts);
export const put= (opts: HTTPRequest) => sendRequest("put", opts);
export const patch = (opts: HTTPRequest) => sendRequest("patch", opts);
export const del = (opts: HTTPRequest) => sendRequest("del", opts);
export const getEntity: <T> (route: string) => Promise<T | undefined> = async (route) => {
    try {
        const entityResponse = await get({url: route});
        return entityResponse.body;
    } catch (response) {
        if (response.status === 404) {
            return undefined;
        } else {
            throw response;
        }
    }
};