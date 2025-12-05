import Participant from "./Participant.js";
import { getRouterRtpCapabilities, pipeToRouter } from "../media/handlers/router.handler.js";

export default class Meeting {
    routers = new Map();
    currentRouter = "";

    pipes = new Map();
    pipeLocks = new Map();

    /** @type {Map<string, Participant>} */
    participants = new Map();

    /**
 * @typedef {Object} MeetingUser
 * @property {string} id
 * @property {string} socketId
 * @property {string} name
 * @property {boolean} isSpeaking
 * @property {boolean} micro
 * @property {boolean} camera
 * @property {number|null} emoji
 * @property {boolean} raiseHand
 * @property {{ camera: string|null, micro: string|null }} producers
 * @property {{ camera: string|null, micro: string|null }} consumers
 * @property {{ camera: MediaStream|null, micro: MediaStream|null }} streams
 */

    /**
     * @typedef {Object} DataMeeting
     * @property {MeetingUser[]} dataUsers
     * @property {{
     *   isSharingScreen: boolean,
     *   socketId: string,
     *   producers: { video: string|null, audio: string|null },
     *   consumers: { video: string|null, audio: string|null },
     *   streams: { video: MediaStream|null, audio: MediaStream|null }
     * }} shareScreen
     */
    /** @type {DataMeeting} */
    dataMeeting = {
        dataUsers: [],
        shareScreen: {
            isSharingScreen: false,
            socketId: "",
            producers: { video: "", audio: "" },
            consumers: { video: "", audio: "" },
            streams: { video: null, audio: null },
        },
    };

    messages = [];

    captions = [];

    setCurrentRouter(routerId) {
        this.currentRouter = routerId;
    }

    setRouter(router) {
        this.routers.set(router.id, router);
    }

    setParticipant(socketId, routerId) {
        this.participants.set(socketId, new Participant(routerId));
    }

    getDataMeeting() {
        return this.dataMeeting;
    }

    getRouter(routerId) {
        return this.routers.get(routerId);
    }

    getParticipant(socketId) {
        return this.participants.get(socketId);
    }

    getCurrentRouter() {
        return this.routers.get(this.currentRouter);
    }

    async pipeRouter({ routerSendId, routerReceiveId, producerId }) {
        const routerA = this.getRouter(routerSendId);
        const routerB = this.getRouter(routerReceiveId);
        const pipe = await pipeToRouter(routerA, routerB, producerId, this.pipes);
        return pipe;
    }

    async safePipe({ routerSendId, routerReceiveId, producerId, anotherId }) {
        const key = `${anotherId}/${producerId}/${routerSendId}/${routerReceiveId}`;

        if (this.pipeLocks.has(key)) {
            return await this.pipeLocks.get(key);
        }

        if (this.pipes.has(key)) {
            return this.pipes.get(key);
        }

        const pipePromise = (async () => {
            const pipe = await this.pipeRouter({ routerSendId, routerReceiveId, producerId });
            this.pipes.set(key, pipe);
            this.pipeLocks.delete(key);
            return pipe;
        })();

        this.pipeLocks.set(key, pipePromise);

        return await pipePromise;
    }

    async getRouterRtpCapabilities(socketId) {
        const participant = this.getParticipant(socketId);
        const router = this.getRouter(participant.routerId);
        return await getRouterRtpCapabilities(router);
    }

    async createWebRtcTransport(socketId) {
        const participant = this.getParticipant(socketId);
        const router = this.getRouter(participant.routerId);
        return await participant.createWebRtcTransport(router);
    }

    async connectTransport(socketId, transportId, dtlsParameters) {
        const participant = this.getParticipant(socketId);
        return await participant.connectTransport({ transportId, dtlsParameters });
    }

    /**
 * @param {{ socket: import("socket.io").Socket }} options
 */
    async createProducer({ socketId, transportId, rtpParameters, kind, appData, socket }) {
        const participant = this.getParticipant(socketId);

        const producerId = await participant.createProducer({
            transportId,
            rtpParameters,
            kind,
            appData,
            socket
        });

        const users = this.getDataMeeting().dataUsers;

        const user = users.find(user => user.socketId === socketId);
        switch (appData.source) {
            case "camera":
                user.camera = true;
                user.producers.camera = producerId;
                break;
            case "micro":
                user.micro = true;
                user.producers.micro = producerId;
                break;
            case "screen-video":
                this.dataMeeting.shareScreen.socketId = socketId;
                this.dataMeeting.shareScreen.isSharingScreen = true;
                this.dataMeeting.shareScreen.producers.video = producerId;
                break;
            case "screen-audio":
                this.dataMeeting.shareScreen.socketId = socketId;
                this.dataMeeting.shareScreen.isSharingScreen = true;
                this.dataMeeting.shareScreen.producers.audio = producerId;
                break;
            default:
                break;
        }

        return producerId;
    }

    async createConsumer({ producerId, rtpCapabilities, transportId, kind, socketId, anotherId, appData, socket }) {
        const participant = this.getParticipant(socketId);
        const participantProducer = this.getParticipant(anotherId);

        const routerSendId = participantProducer.routerId;
        const routerReceiveId = participant.routerId;

        if (routerSendId !== routerReceiveId) {
            const pipe = await this.safePipe({ routerSendId, routerReceiveId, producerId, anotherId });
            producerId = pipe.pipeProducer.id;
        }

        return await participant.createConsumer({
            transportId,
            rtpCapabilities,
            producerId,
            kind,
            appData,
            socket,
            socketId,
            anotherId
        });
    }

    async resumeConsumer({ socketId, consumerId }) {
        const participant = this.getParticipant(socketId);
        await participant.resumeConsumer({ consumerId });
    }

    async closeProducer({ socketId, producerId }) {
        const participant = this.getParticipant(socketId);
        const { isSuccess, type } = await participant.closeProducer({ producerId });
        const routerPostId = participant.routerId;

        const users = this.getDataMeeting().dataUsers;
        const user = users.find(user => user.socketId === socketId);

        switch (type.source) {
            case "camera":
                user.camera = false;
                user.producers.camera = "";
                break;
            case "micro":
                user.micro = false;
                user.producers.micro = "";
                break;
            case "screen-video":
                this.dataMeeting.shareScreen.socketId = "";
                this.dataMeeting.shareScreen.isSharingScreen = false;
                this.dataMeeting.shareScreen.producers.video = "";
                break;
            case "screen-audio":
                this.dataMeeting.shareScreen.socketId = "";
                this.dataMeeting.shareScreen.isSharingScreen = false;
                this.dataMeeting.shareScreen.producers.audio = "";
                break;
            default:
                break;
        }

        if (isSuccess) {
            for (const [routerId, router] of this.routers) {
                if (routerId === routerPostId) continue;
                const key = `${socketId}/${producerId}/${routerPostId}/${routerId}`;
                const pipe = this.pipes.get(key);
                if (pipe.pipeConsumer) {
                    await pipe.pipeConsumer.close();
                }
                if (pipe.pipeProducer) {
                    await pipe.pipeProducer.close();
                }
                this.pipes.delete(key);
            }
        }
    }


}
