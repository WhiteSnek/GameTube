import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";

import { createGateway } from "./websocket/gateway";
import { ClientManager } from "./websocket/client.manager";
import { WebSocketPublisher } from "./publishers/websocket.publisher";
import { ChatService } from "./services/chat.service";
import { ChatController } from "./controller/chat.controller";
import UserRepository from "./repository/user.repository";
import ChatRepository from "./repository/chat.repository";
import { createChatRouter } from "./routes/chat.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:3000
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const server = http.createServer(app);

const manager = new ClientManager();
const publisher = new WebSocketPublisher(manager);

const userRepository = new UserRepository();
const chatRepository = new ChatRepository();

const service = new ChatService(
  publisher,
  userRepository,
  chatRepository
);

const controller = new ChatController(service);

app.use("/chat", createChatRouter(controller));

createGateway(server, manager, controller);

server.listen(8080, () => {
  console.log("Server running on port 8080");
});