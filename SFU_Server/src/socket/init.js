import {
    joinMeeting,
    getRouterRtpCapabilities,
    createWebRtcTransport,
    connectTransport,
    produce,
    consume,
    resume,
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

        socket.on("produce", async ({ producerTransportId, rtpParameters, kind, appData }, callback) => {

            const { producerId } = await produce({
                producerTransportId,
                rtpParameters,
                kind,
                meetingId: socket.meetingId,
                socketId: socket.id,
                appData
            });

            socket.to(socket.meetingId).emit("newProducer", {
                socketId: socket.id,
                producerId,
                kind,
                appData
            });

            callback({ producerId });
        });

        socket.on("consume", async ({ producerId, rtpCapabilities, consumerTransportId, kind, socketId, appData }, callback) => {
            
            const params = await consume({
                producerId,
                rtpCapabilities,
                consumerTransportId,
                kind,
                anotherId: socketId,
                socketId: socket.id,
                meetingId: socket.meetingId,
                appData
            });

            callback(params);
        });

        socket.on("resume", async ({ consumerId }) => {
            await resume({
                socketId: socket.id, 
                meetingId: socket.meetingId, 
                consumerId
            });
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
