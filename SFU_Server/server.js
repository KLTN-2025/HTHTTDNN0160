import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createWorkers } from "./src/media/handlers/worker.handler.js";
import { initSocketEvents } from "./src/socket/init.js";
import Meeting from "./src/models/Meeting.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

app.use(express.static("public"));

/** @type {Map<string, Meeting>} */
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