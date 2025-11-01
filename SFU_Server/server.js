import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createWorkers } from "./src/media/handlers/worker.handler.js";
import { initSocketEvents } from "./src/socket/init.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

export const meetings = new Map();

const initMediasoupProcessings = async () => {
    await createWorkers();
    console.log("Khởi tạo tiến trình worker mediasoup thành công");
}

server.listen(3000, async () => {
    console.log("Server running on http://127.0.0.1:3000");
    await initSocketEvents(io);
    await initMediasoupProcessings();
});