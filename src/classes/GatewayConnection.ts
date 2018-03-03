import { SocketConnection } from "../util/gateway/SocketConnection";
import { EventEmitter } from "events";
import { HelloPayload, Payload, CloseCodes, GatewayEventsMap, InvalidSessionPayload, Opcodes } from "../util/gateway/GatewayEvents";
import { Analytics } from "../util/Analytics";
import { Dispatcher } from "../util/Dispatcher";

const UWS_FAIL_RECONNECT_INTERVAL_MS = 2000;

export abstract class GatewayConnection extends EventEmitter {

    protected connection?: SocketConnection;

    protected lastAck: number | null;
    protected heartbeatInterval: number;
    protected _heartbeatInterval?: NodeJS.Timer;
    protected connecting: boolean = false;

    protected sequence: number | null = null;

    constructor(protected readonly gateway: string = "wss://gateway.discord.gg/?encoding=etf&v=6&compress=zlib-stream", private heartbetaOP: number = Opcodes.HEARTBEAT) {
        super();
        let disconnectedCount = 0;
        setInterval(() => {
            if (disconnectedCount > 3) {
                Analytics.debug("life-support", "Connection not re-established for three cycles. Re-connecting.");
                this.refresh();
                disconnectedCount = 0;
                return;
            }
            if (!this.connection) {
                disconnectedCount++;
                return;
            }
            if (!this.connection.open) {
                disconnectedCount++;
                return;
            }
            disconnectedCount = 0;
        }, 60000);
    }

    /**
     * Connect to the gateway
     */
    public connect(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.connection) {
                this.connection = this.initConnection();
            }
            Analytics.debug("gateway", `Establishing connection to "${this.gateway}"`);
            this.connection.connect();
            this.connection.once("open", () => resolve());
        });
    }

    /**
     * Sends a payload to the gateway
     * 
     * @param payload the payload to send
     */
    public async send(payload: Payload) {
        if (!this.connection || !this.connection.open) {
            await this.connect();
        }
        Analytics.debug("gateway-outbox", `Sending payload ${GatewayEventsMap[payload.op]} to server`);
        await (this.connection as SocketConnection).send(payload);
    }

    /**
     * Initializes a connection instance
     */
    protected initConnection(): SocketConnection {
        this.clearHeartbeater();
        Analytics.debug("gateway", "Initializing a base socket wrapper");
        const socket = new SocketConnection(this.gateway);
        socket.on("packet", (packet) => this.handlePayload(packet));
        socket.on("error", error => {
            if (error.message === "uWs client connection error") {
                if (this.connecting) {
                    Analytics.debug("socket-core", "uWs error");
                    return;
                }
                this.connecting = true;
                Analytics.debug("socket-core", `Error occurred during connection, re-connecting in ${UWS_FAIL_RECONNECT_INTERVAL_MS / 1000} seconds`);
                setTimeout(() => this.refresh().then(() => this.connecting = false), UWS_FAIL_RECONNECT_INTERVAL_MS);
                return;
            }
            Analytics.debug("socket-core", `Error occurred in socket core layer:\n${JSON.stringify(error)}`);
        });
        socket.on("close", () => this.refresh());
        return socket;
    }

    /**
     * Refreshes the connection
     * 
     * Disconnects from the gateway, then re-initializes a connection.
     * 
     * @param closeCode optional close code
     */
    public async refresh(closeCode?: number) {
        if (this.connection) {
            this.connection.close(closeCode);
            this.connecting = false;
        }
        await this.connect();
    }

    /**
     * Internal payload handler
     */
    public abstract handlePayload(payload: Payload): void;

    /**
     * Sends the actual heartbeat to the gateway regardless of intervals
     */
    protected async expeditedHeartbeat() {
        Analytics.debug("life-support", "Sending a heartbeat");
        if (this.lastAck !== null) {
            const timespan = Date.now() - this.lastAck;
            const missedCycles = timespan / this.heartbeatInterval;
            if (missedCycles > 3) {
                Analytics.debug("life-support", "Zombified connection detected - reconnecting.");
                await this.refresh(CloseCodes.SESSION_TIMEOUT);
            } else {
                Analytics.debug("life-support", `Last ack timestamp seems okay. (Missed acks: ${missedCycles})`);
            }
        }
        await this.send({op: this.heartbetaOP, d: this.sequence});
    }

    /**
     * Clears the heartbeater. Useful when we are re-connecting.
     */
    protected clearHeartbeater() {
        if (this._heartbeatInterval) {
            Analytics.debug("life-support", "Clearing previous heartbeat timer.");
            clearInterval(this._heartbeatInterval);
            this._heartbeatInterval = undefined;
        }
    }

    protected heartbeat() {
        Analytics.debug("life-support", "Initializing a heartbeat timer");
        this.clearHeartbeater();
        this._heartbeatInterval = setInterval(() => this.expeditedHeartbeat(), this.heartbeatInterval) as any;
    }

    protected handleHello(payload: HelloPayload) {
        this.heartbeatInterval = payload.d.heartbeat_interval;
        this.lastAck = Date.now() + this.heartbeatInterval;
        this.emit("identifiable");
        this.heartbeat();
    }

    protected handleHBAck() {
        this.lastAck = Date.now();
        Analytics.debug("life-support", "Heartbeat acknowledged.");
    }

}