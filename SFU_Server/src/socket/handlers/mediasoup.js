import { meetings } from "../../../server.js";
import Meeting from "../../models/Meeting.js";
import { findWorkerFeasible } from "../../media/handlers/worker.handler.js";
import { createRouter } from "../../media/handlers/router.handler.js"
import { checkWorkerCurrentUsaged, getWorker } from "../../media/handlers/worker.handler.js";


const existsMeeting = async () => {

}

export const joinMeeting = async (meetingId, socketId) => {
    try {
        let meeting = null;
        let worker = null;
        let router = null;
        /*
            const router = {
                workerId: worker.pid,
                router: await worker.createRouter(optionRouters),
            };
        */
        if (!meetings.has(meetingId)) {
            worker = await findWorkerFeasible();
            router = await createRouter(worker.worker);
            meetings.set(meetingId, new Meeting(router));
            meeting = meetings.get(meetingId);
            meeting.setCurrentRouter(router.router.id);
        } else {
            meeting = meetings.get(meetingId);
            router = meeting.routers.get(meeting.currentRouter);
            worker = getWorker(router.workerId);
            const isFeasible = checkWorkerCurrentUsaged(router.workerId);
            if (!isFeasible) {
                worker = await findWorkerFeasible();
                router = await createRouter(worker.worker);
                meeting.routers.set(router.router.id, router);
                meeting.setCurrentRouter(router.router.id);
            }
        }
        worker.numUsers++;
        meeting.addParticipant(socketId, meeting.currentRouter);
    } catch (error) {
        return {
            status: false
        }
    }
    return {
        status: true
    }
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

export const produce = async ({ producerTransportId, rtpParameters, kind, meetingId, socketId, appData }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const { producerId } = await meeting.createProducer({
        socketId: socketId,
        producerTransportId,
        rtpParameters,
        kind,
        appData
    });

    return { producerId };
}

export const consume = async ({ producerId, rtpCapabilities, consumerTransportId, kind, anotherId, socketId, meetingId, appData }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const params = await meeting.createConsumer({
        producerId,
        rtpCapabilities,
        consumerTransportId,
        kind,
        anotherId,
        socketId,
        appData
    });

    return params;
}

export const resume = async ({ socketId, meetingId, consumerId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    await meeting.resumeConsumer({ socketId, consumerId });

}

