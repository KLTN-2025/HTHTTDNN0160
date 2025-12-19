import { meetings } from "../../../server.js";
import { findWorkerFeasible } from "../../media/handlers/worker.handler.js";
import { createRouter } from "../../media/handlers/router.handler.js"
import { checkWorkerCurrentUsaged, getWorker } from "../../media/handlers/worker.handler.js";

/**
 * @typedef {import('mediasoup').types.Router & { workerId: string }} CustomRouter
 */
/**
 * @param {{ router?: CustomRouter }} options
 * @returns {Promise<CustomRouter>}
 */
export const establishSFU = async ({ router }) => {

    let worker;

    if (router) {
        const isFeasible = checkWorkerCurrentUsaged(router.workerId);
        worker = getWorker(router.workerId);

        if (!isFeasible || !worker) {
            worker = await findWorkerFeasible();
            /** @type {CustomRouter} */
            router = await createRouter(worker);
        }

    } else {
        worker = await findWorkerFeasible();
        router = await createRouter(worker);
    }

    worker.nums = (worker.nums || 0) + 1;

    return router;
}

export const getRouterRtpCapabilities = async (meetingId, socketId) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };
    const rtpCapabilities = await meeting.getRouterRtpCapabilities(socketId);

    return rtpCapabilities;
}

export const createWebRtcTransport = async (meetingId, socketId) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };
    const params = await meeting.createWebRtcTransport(socketId);

    return params;
}

export const connectTransport = async (transportId, dtlsParameters, meetingId, socketId) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };
    const isConnected = await meeting.connectTransport(socketId, transportId, dtlsParameters);
    return isConnected;
}

/**
 * @param {{ socket: import("socket.io").Socket }} options
 */
export const produce = async ({ transportId, rtpParameters, kind, meetingId, socketId, appData, socket }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const producerId = await meeting.createProducer({
        socketId: socketId,
        transportId,
        rtpParameters,
        kind,
        appData,
        socket
    });

    return producerId;
}

export const closeProducer = async ({ producerId, meetingId, socketId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const data = await meeting.closeProducer({ producerId, socketId });
}


export const consume = async ({ producerId, rtpCapabilities, transportId, kind, anotherId, socketId, meetingId, appData, socket }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const params = await meeting.createConsumer({
        producerId,
        rtpCapabilities,
        transportId,
        kind,
        anotherId,
        socketId,
        appData,
        socket
    });

    return params;
}

export const resume = async ({ socketId, meetingId, consumerId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    await meeting.resumeConsumer({ socketId, consumerId });
}
