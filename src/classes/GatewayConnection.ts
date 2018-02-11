import { SocketConnection } from "../util/gateway/SocketConnection";
import { EventEmitter } from "events";
import { Opcodes, HelloPayload, Payload, CloseCodes, GatewayEventsMap, InvalidSessionPayload } from "../util/gateway/GatewayEvents";
import { Analytics } from "../util/Analytics";
import { Dispatcher } from "../util/Dispatcher";

export class GatewayConnection extends EventEmitter {

    private connection?: SocketConnection;

    private lastAck: number | null;
    private heartbeatInterval: number;
    private _heartbeatInterval?: NodeJS.Timer;

    private sequence: number | null = null;

    constructor(private readonly gateway: string = "wss://gateway.discord.gg/?encoding=etf&v=6&compress=zlib-stream") {
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
    private initConnection(): SocketConnection {
        this.clearHeartbeater();
        Analytics.debug("gateway", "Initializing a base socket wrapper");
        const socket = new SocketConnection(this.gateway);
        socket.on("packet", this.handlePayload.bind(this));
        socket.on("error", error => {
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
        }
        await this.connect();
    }

    /**
     * Internal payload handler
     */
    private handlePayload(payload: Payload) {
        if (payload.op !== 0) {
            Analytics.debug("gateway-intake", `Received OPCode ${payload.op} ${GatewayEventsMap[payload.op]}`);
            Dispatcher.dispatch({type: GatewayEventsMap[payload.op], data: payload.d, payload});
        } else {
            Analytics.debug("gateway-intake", `Received dispatch ${payload.t}`);
        }
        switch (payload.op) {
            case Opcodes.HELLO:
                this.handleHello(payload as any);
                break;
            case Opcodes.RECONNECT:
                break;
            case Opcodes.INVALID_SESSION:
                break;
            case Opcodes.HEARTBEAT_ACK:
                this.handleHBAck();
                break;
            case Opcodes.DISPATCH:
                Dispatcher.dispatch({type: payload.t as any, data: payload.d, payload});
                this.emit((payload.t as string).toLowerCase(), payload.d);
                break;
            case Opcodes.INVALID_SESSION:
                Analytics.debug("gateway-auth", "Server reported a bad session.");
            default:
                Analytics.debug("gateway-intake", `Unknown op ${payload.op}`);
                break;
        }
    }

    /**
     * Sends the actual heartbeat to the gateway regardless of intervals
     */
    private async expeditedHeartbeat() {
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
        await this.send({op: Opcodes.HEARTBEAT, d: this.sequence});
    }

    /**
     * Clears the heartbeater. Useful when we are re-connecting.
     */
    private clearHeartbeater() {
        if (this._heartbeatInterval) {
            Analytics.debug("life-support", "Clearing previous heartbeat timer.");
            clearInterval(this._heartbeatInterval);
            this._heartbeatInterval = undefined;
        }
    }

    /**
     * Starts a heartbeat interval.
     */
    private heartbeat() {
        Analytics.debug("life-support", "Initializing a heartbeat timer");
        this.clearHeartbeater();
        this._heartbeatInterval = setInterval(this.expeditedHeartbeat.bind(this), this.heartbeatInterval) as any;
    }

    private handleHello(payload: HelloPayload) {
        this.heartbeatInterval = payload.d.heartbeat_interval;
        this.lastAck = Date.now() + this.heartbeatInterval;
        this.emit("identifiable");
        this.heartbeat();
    }

    private handleHBAck() {
        this.lastAck = Date.now();
        Analytics.debug("life-support", "Heartbeat acknowledged.");
    }
}