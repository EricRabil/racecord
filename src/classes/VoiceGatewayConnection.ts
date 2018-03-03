import { GatewayConnection } from "./GatewayConnection";
import { Payload, VoiceOpcodes, HelloPayload } from "../util/gateway/GatewayEvents";

export class VoiceGatewayConnection extends GatewayConnection {

    public endpoint: string;

    constructor(protected readonly gateway: string) {
        super(gateway, VoiceOpcodes.HEARTBEAT);
    }

    public handlePayload(payload: Payload): void {
        switch (payload.op) {
            case VoiceOpcodes.HELLO:
                (payload as HelloPayload).d.heartbeat_interval *= 0.75;
                this.handleHello(payload as any);
            case VoiceOpcodes.VOICE_READY:
        }
    }

    protected async selectProtocol(mode: string): Promise<void> {
        this.send({
            op: VoiceOpcodes.SELECT_PROTOCOL,
            d: {
                protocol: "udp",
                data: {
                    mode
                }
            }
        });
    }
}