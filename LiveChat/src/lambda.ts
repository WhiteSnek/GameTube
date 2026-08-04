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
  console.log("Incoming event:", JSON.stringify(event, null, 2));

  if (event.requestContext?.routeKey) {
    console.log("WebSocket event:", event.requestContext.routeKey);
    return handleWebSocket(event, controller);
  }

  console.log("HTTP event:", event.requestContext?.http);

  return httpHandler(event, context);
};