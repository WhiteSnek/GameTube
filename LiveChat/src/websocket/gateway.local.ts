import { WebSocketServer } from "ws";
import { Server } from "http";

import { ClientManager } from "./client.manager";
import { ChatController } from "../controller/chat.controller";
import { verifyToken } from "../middleware/chat.middleware";
import { MessageTypeValue } from "../types";

export function createGateway(
  server: Server,
  manager: ClientManager,
  controller: ChatController,
) {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url!, "http://localhost");

    const token = url.searchParams.get("token");

    if (!token) {
      ws.close();
      return;
    }

    const data = verifyToken(token);

    if (!data) {
      ws.close();
      return;
    }

    const { guildId, userId, role } = data;

    manager.add({
      ws,
      guildId,
      userId,
      role
    });

    ws.on("message", async (raw) => {
      try {
        const body = JSON.parse(raw.toString());

        const sender = manager.get(ws);

        if (!sender) return;

        switch (body.action) {
          case "sendMessage":
            await controller.sendMessage(
              body.message,
              body.messageType,
              body.replyTo,
              sender,
            );
            break;

          case "editMessage":
            await controller.editMessage(
              sender,
              body.chatId,
              body.content,
              MessageTypeValue["text"] ?? MessageTypeValue.text,
            );
            break;
          case "deleteMessage":
            await controller.deleteMessage(sender, body.chatId);
            break;

          default:
            ws.send(
              JSON.stringify({
                event: "ERROR",
                message: "Unknown action.",
              }),
            );
        }
      } catch (err) {
        console.error(err);

        ws.send(
          JSON.stringify({
            event: "ERROR",
            message: "Failed to process request.",
          }),
        );
      }
    });

    ws.on("close", () => {
      manager.remove(ws);
    });
  });
}
