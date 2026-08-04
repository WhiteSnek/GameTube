import serverless from "serverless-http";
import express from "express";

import { createContainer } from "./bootstrap/container";
import { createChatRouter } from "./routes/chat.routes";
import { handleWebSocket } from "./websocket/gateway.lambda";

process.env.RUNTIME = "lambda";

const app = express();
app.use(express.json());

const { controller } = createContainer();

app.use("/chat", createChatRouter(controller));

const httpHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // WebSocket events
  if (event.requestContext?.routeKey) {
    return handleWebSocket(event, controller);
  }

  // HTTP events
  return httpHandler(event, context);
};