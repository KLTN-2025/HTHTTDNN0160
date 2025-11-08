import Participant from "./Participant.js";

import { getRouterRtpCapabilities, pipeRouters } from "../media/handlers/router.handler.js";

export default class Meeting {
    routers = new Map();
    pipes = new Map();
    currentRouter = "";

    constructor(router) {
        this.router = router;
        this.participants = new Map();
        this.routers.set(router.router.id, this.router);
    }

    // set current router -> will help next users choose router and check feasible 
    setCurrentRouter(routerId) {
        this.currentRouter = routerId;
    }

    getRouter(routerId) {
        return this.routers.get(routerId);
    }

    addParticipant(socketId, routerId) {
        this.participants.set(socketId, new Participant(routerId));
    }

    async pipeRouter(producerId, routerSend, socketId) {

        const routerA = this.routers.get(routerSend).router;
        
        for (const [routerId, router] of this.routers) {
            if (routerId !== routerSend) {
                const pipeRouter = await pipeRouters(routerA, router.router, producerId);
                console.log(pipeRouter, "✅ Piped successfully");

                this.pipes.set(`${socketId}-${producerId}-${routerSend}-${routerId}`, pipeRouter);
            }
        }
    }

    // 1. Get info from router -> client: load device
    async getRouterRtpCapabilities(socketId) {
        const participant = this.participants.get(socketId);

        const router = this.routers.get(participant.routerId);

        const rtpCapabilities = await getRouterRtpCapabilities(router.router);

        return rtpCapabilities;
    }

    // 2. create 2 transports: producer, consumer
    async createWebRtcTransport(socketId) {
        const participant = this.participants.get(socketId);
        const router = this.routers.get(participant.routerId);
        const params = await participant.createWebRtcTransport(router.router);

        return params;
    }

    // 3. produce, consume will run connect first
    async connectTransport(socketId, transportId, dtlsParameters) {
        const participant = this.participants.get(socketId);
        const isConnect = await participant.connectTransport({ transportId, dtlsParameters });
        return isConnect;
    }

    // 4. provide track video, audio, video screensharing
    async createProducer({ socketId, producerTransportId, rtpParameters, kind }) {

        const participant = this.participants.get(socketId);

        const { producerId } = await participant.createProducer({ producerTransportId, rtpParameters, kind });

        await this.pipeRouter(producerId, participant.routerId, socketId);

        return { producerId };
    }

    // 5. receive track video, audio, video screensharing
    async createConsumer(producerId, rtpCapabilities, consumerTransportId, kind, socketId, youId) {
        const participant = this.participants.get(youId);
        console.log(participant, "herre", youId);

        const participantProducer = this.participants.get(socketId);

        if (this.participants.has(socketId)) {
            if (participant.routerId !== participantProducer.routerId) {
                const virtualProducer = this.pipes.get(`${socketId}-${producerId}-${participantProducer.routerId}-${participant.routerId}`);

                const virtualProducerId = virtualProducer.pipeProducer.id;

                producerId = virtualProducerId
            }
        }

        

        const { params } = await participant.createConsumer({ consumerTransportId, rtpCapabilities, producerId, kind });

        return params;
    }

    // 6. when receive track video -> have to paused -> therefore, must resume consume
    async resumeConsumer(socketId, consumerId) {
        const participant = this.participants.get(socketId);
        await participant.resumeConsumer({ consumerId });
    }

}