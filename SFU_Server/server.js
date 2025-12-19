import express from "express";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createWorkers } from "./src/media/handlers/worker.handler.js";
import { initSocketEvents } from "./src/socket/init.js";
import Meeting from "./src/models/Meeting.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error("Lỗi chi tiết:", error);
  }
}

// run();

console.log(process.env.GEMINI_API_KEY);

export const geminiModelTranslator = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "Bạn là một phiên dịch viên thông minh, hãy giúp tôi dịch các đoạn text chính xác"
});

server.listen(3000, async () => {
    console.log("Server running on http://127.0.0.1:3000");
    await initSocketEvents(io);
    await initMediasoupProcessings();
});