import { GatewayConnection } from "./GatewayConnection";
import { Payload, GatewayEventsMap, Opcodes, HelloPayload } from "../util/gateway/GatewayEvents";
import { Analytics } from "../util/Analytics";
import { Dispatcher } from "../util/Dispatcher";
import { VoiceChannel } from "./channel";

export class TextGatewayConnection extends GatewayConnection {

    /**
     * Internal payload handler
     */
    public handlePayload(payload: Payload) {
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

    public joinVoiceChannel(channel: VoiceChannel, opts: {self_mute: boolean, self_deaf: boolean}): Promise<void> {
        return this.send({
            d: {
                guild_id: channel.guild_id,
                channel_id: channel.id,
                ...opts
            },
            op: 4
        });
    }

}