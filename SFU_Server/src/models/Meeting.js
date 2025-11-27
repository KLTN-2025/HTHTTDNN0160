import Participant from "./Participant.js";

import { getRouterRtpCapabilities, pipeToRouter } from "../media/handlers/router.handler.js";

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
    // this.pipes.set(`${socketId}-${producerId}-${routerSend}-${routerId}`, pipeRouter);

    async pipeRouter({ routerSendId, routerReceiveId, producerId }) {
        const routerA = this.getRouter(routerSendId).router;
        const routerB = this.getRouter(routerReceiveId).router;
        const pipe = await pipeToRouter(routerA, routerB, producerId);

        return pipe;
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
    async createProducer({ socketId, producerTransportId, rtpParameters, kind, appData }) {
        const participant = this.participants.get(socketId);

        const { producerId } = await participant.createProducer({
            producerTransportId,
            rtpParameters,
            kind,
            appData
        });

        return { producerId };
    }

    // 5. receive track video, audio, video screensharing
    async createConsumer({ producerId, rtpCapabilities, consumerTransportId, kind, socketId, anotherId, appData }) {
        const participant = this.participants.get(socketId);
        const participantProducer = this.participants.get(anotherId);
        const routerSendId = participantProducer.routerId;
        const routerReceiveId = participant.routerId;

        if (routerSendId !== routerReceiveId) {
            const pipe = this.pipes.get(`${anotherId}-${producerId}-${routerSendId}-${routerReceiveId}`);
            if (!pipe) {
                const pipe = await this.pipeRouter({ routerSendId, routerReceiveId, producerId });
                this.pipes.set(`${anotherId}-${producerId}-${routerSendId}-${routerReceiveId}`, pipe);
                producerId = pipe.pipeProducer.id;
            } else {
                producerId = pipe.pipeProducer.id;
            }
        }

        const { params } = await participant.createConsumer({
            consumerTransportId,
            rtpCapabilities,
            producerId,
            kind,
            appData
        });

        return params;
    }

    // 6. when receive track video -> have to paused -> therefore, must resume consume
    async resumeConsumer({ socketId, consumerId }) {
        const participant = this.participants.get(socketId);
        await participant.resumeConsumer({ consumerId });
    }

}