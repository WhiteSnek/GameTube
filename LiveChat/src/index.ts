import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";

import { createContainer } from "./bootstrap/container";
import { createChatRouter } from "./routes/chat.routes";
import { createGateway } from "./websocket/gateway.local";

process.env.RUNTIME = "local";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

const server = http.createServer(app);

const {
    manager,
    controller
} = createContainer();

app.use("/chat", createChatRouter(controller));

createGateway(server, manager, controller);

server.listen(8080);