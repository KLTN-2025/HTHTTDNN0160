import Participant from "./Participant.js";

import { getRouterRtpCapabilities } from "../router.js";

export default class Meeting {
    routers = new Map();
    currentRouter = "";
    constructor(router) {
        this.router = router;
        this.participants = new Map();
        this.routers.set(router.router.id, this.router);
    }

    setCurrentRouter(routerId) {
        this.currentRouter = routerId;
    }

    addParticipant(socketId, routerId) {
        this.participants.set(socketId, new Participant(routerId));
    }

    async getRouterRtpCapabilities(socketId) {
        const participant = this.participants.get(socketId);
        const router = this.routers.get(participant.routerId);
        
        const rtpCapabilities = await getRouterRtpCapabilities(router.router);
        
        return rtpCapabilities;
    }

    async createWebRtcTransport(socketId) {
        const participant = this.participants.get(socketId);
        const router = this.routers.get(participant.routerId);
        const params = await participant.createWebRtcTransport(router.router);

        return params;
    }

    async connectTransport(socketId, transportId, dtlsParameters) {
        const participant = this.participants.get(socketId);
        const isConnect = await participant.connectTransport({ transportId, dtlsParameters });
        return isConnect;
    }

    async createProducer({ socketId, producerTransportId, rtpParameters, kind }) {
        const participant = this.participants.get(socketId);
        
        const { producerId, routerId } = await participant.createProducer({ producerTransportId, rtpParameters, kind });
        
        return { producerId, routerId };
    }

    async createConsumer({ socketId, consumerTransportId, rtpCapabilities, producerId, kind }) {
        const participant = this.participants.get(socketId);
        
        const {params} = await participant.createConsumer({ consumerTransportId, rtpCapabilities, producerId, kind });

        return params;
    }

    async resumeConsumer({ socketId, consumerId }) {
        const participant = this.participants.get(socketId);

        await participant.resumeConsumer({ consumerId });
    }

}