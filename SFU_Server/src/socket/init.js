import { Server, Socket } from "socket.io";
import {
    getRouterRtpCapabilities,
    createWebRtcTransport,
    connectTransport,
    produce,
    consume,
    resume,
    closeProducer,
} from "./handlers/mediasoup.js";

import {
    joinMeeting,
    leaveMeeting,
    showEmoji,
    eraseEmoji
} from "./handlers/meeting.js";

/** 
 * @param {Server} io 
 */

export const initSocketEvents = (io) => {
    io.on("connection", (socket) => {

        socket.on("join-meeting", async ({ meetingId, user }, callback) => {
            socket.meetingId = meetingId;
            socket.join(meetingId);

            const { participant, users } = await joinMeeting({
                meetingId,
                socketId: socket.id,
                user
            });

            socket.to(meetingId).emit("new-participant", ({
                participant
            }));

            callback(users);
        });

        socket.on("getRouterRtpCapabilities", async (_, callback) => {
            const rtpCapabilities = await getRouterRtpCapabilities(socket.meetingId, socket.id);
            callback(rtpCapabilities);
        });

        socket.on("createWebRTCTransport", async (_, callback) => {
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

        socket.on("produce", async ({ transportId, rtpParameters, kind, appData }, callback) => {
            /** @type {import("socket.io").Socket} */
            const producerId = await produce({
                transportId,
                rtpParameters,
                kind,
                meetingId: socket.meetingId,
                socketId: socket.id,
                appData,
                socket: socket
            });

            socket.to(socket.meetingId).emit("new-producer", {
                socketId: socket.id,
                producerId,
                kind,
                appData
            });

            callback(producerId);
        });

        socket.on("close-producer", async ({ producerId }) => {
            await closeProducer({ 
                producerId,
                meetingId: socket.meetingId,
                socketId: socket.id,
            })
        });

        socket.on("show-emoji", (id) => {
            const data = showEmoji({
                id,
                meetingId: socket.meetingId,
                socketId: socket.id
            });

            socket.to(socket.meetingId).emit("show-emoji-receive", { socketId: socket.id, id });
        });

        socket.on("erase-emoji", (id) => {
            const data = eraseEmoji({
                id,
                meetingId: socket.meetingId,
                socketId: socket.id
            });

            socket.to(socket.meetingId).emit("erase-emoji-receive", { socketId: socket.id });
        });

        socket.on("raise-hand", () => {
            const data = showEmoji({
                meetingId: socket.meetingId,
                socketId: socket.id
            });

            socket.to(socket.meetingId).emit("raise-hand-receive", { socketId: socket.id });
        });

        socket.on("lower-hand", () => {
            const data = showEmoji({
                meetingId: socket.meetingId,
                socketId: socket.id
            });

            socket.to(socket.meetingId).emit("lower-hand-receive", { socketId: socket.id });
        });

        socket.on("consume", async ({ producerId, rtpCapabilities, transportId, kind, socketId, appData }, callback) => {

            const params = await consume({
                producerId,
                rtpCapabilities,
                transportId,
                kind,
                anotherId: socketId,
                socketId: socket.id,
                meetingId: socket.meetingId,
                appData,
                socket: socket
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

        socket.on("disconnect", async () => {

            const data = await leaveMeeting({
                socket: socket.id,
                meetingId: socket.meetingId
            });


        });
    });
};
