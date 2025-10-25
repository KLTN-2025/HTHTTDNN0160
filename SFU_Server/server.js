import express from "express";
import http from "http";
import { Server } from "socket.io";

import mediasoup from "mediasoup";
import { createWorkers, findWorkerFeasible } from "./src/worker.js";
import { createRouter } from "./src/router.js";
import { mediasoup as mediasoupConfig } from "./src/mediasoup.config.js";

import Meeting from "./class/Meeting.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

// worker
const optionWorkers = mediasoupConfig.mediasoup.worker;
const numberWorkers = mediasoupConfig.mediasoup.numberWorkers;

// router
const mediacodecs = mediasoupConfig.mediasoup.router;


const meetings = new Map();

const startServer = async () => {
    await createWorkers(mediasoup, numberWorkers, optionWorkers);
    console.log("Khởi tạo tiến trình worker mediasoup thành công");
}

startServer();

io.on("connection", async (socket) => {

    socket.on("join-meeting", async ({ meetingId }, callback) => {
        socket.meetingId = meetingId;
        let meeting;
        socket.join(meetingId);
        if (!meetings.has(meetingId)) {
            const worker = await findWorkerFeasible();
            const router = await createRouter(worker, mediacodecs);
            meeting = new Meeting(router);
            meetings.set(meetingId, meeting);
            meeting = meetings.get(meetingId);
        } else {
            meeting = meetings.get(meetingId);
        }
        console.log("last router", meeting);
        
        meeting.addParticipant(socket.id, meeting.lastRouter);
        callback({ status: "ok" });
    });

    socket.on("getRouterRtpCapabilities", async (_, callback) => {
        const meeting = meetings.get(socket.meetingId);
        if (!meeting) return callback({ error: "Meeting not found" });

        const rtpCapabilities = await meeting.getRouterRtpCapabilities(socket.id);
        callback(rtpCapabilities);
    });

    socket.on("createWebRtcTransport", async (_, callback) => {
        const meeting = meetings.get(socket.meetingId);
        if (!meeting) return callback({ error: "Meeting not found" });

        const params = await meeting.createWebRtcTransport(socket.id);
        
        callback(params);
    });

    socket.on("connectTransport", async ({ transportId, dtlsParameters }, callback) => {
        const meeting = meetings.get(socket.meetingId);
        if (!meeting) return callback({ error: "Meeting not found" });

        const isConnected = await meeting.connectTransport(socket.id, transportId, dtlsParameters);
        callback(isConnected);
    });

    socket.on("produce", async ({ producerTransportId, rtpParameters, kind }, callback) => {
        const meeting = meetings.get(socket.meetingId);
        if (!meeting) return callback({ error: "Meeting not found" });
        console.log("socket side", producerTransportId);
        
        const { producerId } = await meeting.createProducer({
            socketId: socket.id,
            producerTransportId,
            rtpParameters,
            kind,
        });

        socket.to(socket.meetingId).emit("newProducer", {
            socketId: socket.id,
            producerId,
            kind,
        });

        callback({ producerId });
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

        console.log("params", params);


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


server.listen(3000, () => console.log("Server running on http://127.0.0.1:3000"));
