import * as superagent from "superagent";
import "./patches/superagentPatch";
import { Backoff } from "./rest/Backoff";

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'del';

export interface HTTPRequest {
    url: string,
    query?: {[key: string]: any} | string,
    body?: any,
    headers?: {[key: string]: any},
    backoff?: Backoff,
    retried?: number,
    retries?: number,
};

export interface FulfilledRequest {
    header: any;
    body: any;
    status: number;
}

export interface HTTPPromise {
    then(handler: (req: FulfilledRequest) => any): void;
    catch(handler: (req: FulfilledRequest) => any): void;
}

export function sendRequest(method: HTTPMethod, opts: HTTPRequest, resolveOverride?: () => void, rejectOverride?: () => void): HTTPPromise {
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

export type HTTPFunction = (opts: HTTPRequest) => Promise<FulfilledRequest>;

export const get: HTTPFunction = sendRequest.bind(null, "get");
export const post: HTTPFunction = sendRequest.bind(null, "post");
export const put: HTTPFunction = sendRequest.bind(null, "put");
export const patch: HTTPFunction = sendRequest.bind(null, "patch");
export const del: HTTPFunction = sendRequest.bind(null, "del");