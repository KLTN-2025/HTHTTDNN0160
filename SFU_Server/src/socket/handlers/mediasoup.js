import { meetings } from "../../../server.js";
import Meeting from "../../models/Meeting.js";
import { findWorkerFeasible } from "../../media/handlers/worker.handler.js";
import { createRouter } from "../../media/handlers/router.handler.js"
import { checkWorkerCurrentUsaged } from "../../media/handlers/worker.handler.js";

const existsMeeting = async () => {

}

export const joinMeeting = async (meetingId, socketId) => {
    try {
        let meeting = null;
        /*
            const router = {
                workerId: worker.pid,
                router: await worker.createRouter(optionRouters),
            };
        */
        if (!meetings.has(meetingId)) {
            const worker = await findWorkerFeasible();
            const router = await createRouter(worker);
            meetings.set(meetingId, new Meeting(router));
            meeting = meetings.get(meetingId);
            meeting.setCurrentRouter(router.router.id);
        } else {
            meeting = meetings.get(meetingId);
            const router = meeting.routers.get(meeting.currentRouter);
            const isFeasible = checkWorkerCurrentUsaged(router.workerId);
            if (!isFeasible) {
                const worker = await findWorkerFeasible();
                const router = await createRouter(worker);
                meeting.routers.set(router.router.id, router);
                meeting.setCurrentRouter(router.router.id);
            }
        }
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

export const produce = async (producerTransportId, rtpParameters, kind, meetingId, socketId) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const { producerId, routerId } = await meeting.createProducer({
        socketId: socketId,
        producerTransportId,
        rtpParameters,
        kind,
    });

    return { producerId, routerId };
}

