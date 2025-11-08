import {
    joinMeeting,
    getRouterRtpCapabilities,
    createWebRtcTransport,
    connectTransport,
    produce,
    consume,
    resume
} from "./handlers/mediasoup.js";

export const initSocketEvents = (io) => {
    io.on("connection", async (socket) => {
        socket.on("join-meeting", async ({ meetingId }, callback) => {
            socket.meetingId = meetingId;
            socket.join(meetingId);
            const { status } = await joinMeeting(meetingId, socket.id);
            callback(status);
        });

        socket.on("getRouterRtpCapabilities", async (_, callback) => {
            const rtpCapabilities = await getRouterRtpCapabilities(socket.meetingId, socket.id);
            callback(rtpCapabilities);
        });

        socket.on("createWebRtcTransport", async (_, callback) => {
            const params = await createWebRtcTransport(socket.meetingId, socket.id);
            callback(params);
        });

        socket.on("connectTransport", async ({ transportId, dtlsParameters }, callback) => {
            const isConnected = await connectTransport(
                transportId,
                dtlsParameters,
                socket.meetingId,
                socket.id
            );
            callback(isConnected);
        });

        socket.on("produce", async ({ producerTransportId, rtpParameters, kind }, callback) => {
            const { producerId } = await produce(
                producerTransportId,
                rtpParameters,
                kind,
                socket.meetingId,
                socket.id
            );

            socket.to(socket.meetingId).emit("newProducer", {
                socketId: socket.id,
                producerId,
                kind,
            });

            callback({ producerId });
        });

        socket.on(
            "consume",
            async (
                { producerId, rtpCapabilities, consumerTransportId, kind, socketId },
                callback
            ) => {
                const params = await consume(
                    producerId,
                    rtpCapabilities,
                    consumerTransportId,
                    kind,
                    socketId,
                    socket.id,
                    socket.meetingId
                );
                callback(params);
            }
        );

        socket.on("resume", async ({ consumerId }, callback) => {

            await resume(socket.id, socket.meetingId, consumerId);

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
};
