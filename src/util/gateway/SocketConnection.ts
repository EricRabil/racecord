import * as erlpack from "erlpack";
import * as ws from "uws";
import * as zlib from "zlib-sync";
import { EventEmitter } from "events";
import { Payload, CloseCodes } from "./GatewayEvents";
import { Analytics } from "../Analytics";
import * as util from "util";
import { Dispatcher } from "../Dispatcher";
import { ActionTypes } from "../../types/structures/action";

export declare interface SocketConnection {
    on(event: "message", handler: (event: {
        data: any;
        type: string;
        target: ws;
    }) => any): this;
    on(event: "close", handler: (event: {
        wasClean: boolean;
        code: number;
        reason: string;
        target: WebSocket;
    }) => any): this;
    on(event: "error", handler: (error: Error) => any): this;
    on(event: "open", handler: (event: {
        target: ws;
    }) => any): this;
    on(event: "packet", handler: (event: Payload) => any): this;
    on(event: string, listener: Function): this;
}

export interface SocketEvent {
    data: any;
    type: string;
    target: ws;
}

export class SocketConnection extends EventEmitter {
    private ws: ws;
    private closing: boolean;
    private inflate: zlib.Inflate;

    private errorCount: number = 0;

    public constructor(private readonly GW_URL: string) {
        super();
        this.inflate = new zlib.Inflate({
            chunkSize: 65536
        });
        this.on("message", async ({data}) => {
            const payload: Uint8Array = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
            const length: number = payload.length;
            const flush = length >= 4 &&
                payload[length - 4] === 0x00
                && payload[length - 3] === 0x00
                && payload[length - 2] === 0xFF
                && payload[length - 1] === 0xFF;

            this.inflate.push(payload, flush && zlib.Z_SYNC_FLUSH);

            Analytics.debug("socket-core", "Received data from the server");

            if (!flush) {
                Analytics.debug("socket-core", "No flush header, stopping here.");
                return;
            }

            Analytics.debug("socket-core", "Flushed! Pulling the inflated result.");

            const finalData: Buffer = this.inflate.result;

            try {
                this.emit("packet", erlpack.unpack(finalData));
                this.errorCount = 0;
            } catch (e) {
                Dispatcher.dispatch({type: ActionTypes.INVALID_SESSION});
                this.errorCount++;
                if (this.errorCount >= 4) {
                    this.close();
                }
            }
        });
    }

    public send(data: Payload): Promise<void> {
        return new Promise((resolve) => {
            this.ws.send(erlpack.pack(data), (e) => {
                resolve();
            });
        });
    }

    public connect(): void {
        this.closing = false;
        this.ws = new ws(this.GW_URL);
        this.ws.onopen = event => this.emit("open", event);
        this.ws.onmessage = event => this.emit("message", event);
        this.ws.onclose = event => this.emit("close", event);
        this.ws.onerror = event => this.emit("error", event);
    }

    public close(code?: number): void {
        this.ws.close(code);
    }

    public get open(): boolean {
        return this.ws.readyState === ws.OPEN;
    }
}