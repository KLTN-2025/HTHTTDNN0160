import {
    joinMeeting,
    getRouterRtpCapabilities,
    createWebRtcTransport,
    connectTransport,
    produce
} from "./handlers/mediasoup.js";

export const initSocketEvents = (io) => {
    io.on("connection", async (socket) => {
        socket.on("join-meeting", async ({ meetingId }, callback) => {
            socket.meetingId = meetingId;
            socket.join(meetingId);
            const { status } = joinMeeting(meetingId, socket.id);
            callback(status);
        });

        socket.on("getRouterRtpCapabilities", async (_, callback) => {
            const rtpCapabilities = getRouterRtpCapabilities(socket.meetingId, socketId)
            callback(rtpCapabilities);
        });

        socket.on("createWebRtcTransport", async (_, callback) => {
            const params = createWebRtcTransport(socket.meetingId, socketId)
            callback(params);
        });

        socket.on("connectTransport", async ({ transportId, dtlsParameters }, callback) => {
            const isConnected = connectTransport(transportId, dtlsParameters, socket.meetingId, socket.id)
            callback(isConnected);
        });

        socket.on("produce", async ({ producerTransportId, rtpParameters, kind }, callback) => {
            const { producerId, routerId } = await produce(producerTransportId, rtpParameters, kind, socket.meetingId, socket.id);

            socket.to(socket.meetingId).emit("newProducer", {
                socketId: socket.id,
                producerId,
                kind,
                routerId
            });

            callback({ producerId, routerId });
        });

        socket.on("consume", async ({ producerId, rtpCapabilities, consumerTransportId, kind }, callback) => {
            const meeting = meetings.get(socket.meetingId);
            if (!meeting) return callback({ error: "Meeting not found" });

            const params = await meeting.createConsumer({
                socketId: socket.id,
                consumerTransportId,
                rtpCapabilities,
                producerId,
                kind
            });

            if (!params) return callback({ error: "Cannot consume" });

            callback(params);
        });

        socket.on("resume", async ({ consumerId }, callback) => {
            const meeting = meetings.get(socket.meetingId);
            if (!meeting) return callback({ error: "Meeting not found" });

            await meeting.resumeConsumer({ socketId: socket.id, consumerId });
        });

        socket.on("disconnect", () => {
            const meeting = meetings.get(socket.meetingId);
            if (!meeting) return;

            const participant = meeting.participants.get(socket.id);
            if (participant) {
                participant.closeAllTransports();
                meeting.participants.delete(socket.id);
            }

            if (meeting.participants.size === 0) {
                meetings.delete(socket.meetingId);
            }
        });
    });
}


