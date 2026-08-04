import serverless from "serverless-http";
import express from "express";

import { createContainer } from "./bootstrap/container";
import { createChatRouter } from "./routes/chat.routes";

process.env.RUNTIME = "lambda";

const app = express();

app.use(express.json());

const {
    controller
} = createContainer();

app.use("/chat", createChatRouter(controller));

export const api = serverless(app);