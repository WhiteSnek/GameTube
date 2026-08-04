import { WebSocketServer } from "ws";
import { ClientManager } from "./client.manager";
import { ChatController } from "../controller/chat.controller";
import { verifyToken } from "../middleware/chat.middleware";

import { Server } from "http";

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
    const token = url.searchParams.get("token")!;
    const data = verifyToken(token);
    if (!data) {
      ws.close();
      return;
    }
    const { guildId, userId } = data;
    manager.add({
      ws,
      guildId,
      userId,
      fullName: userId,
    });

    ws.on("message", async (raw) => {
      const body = JSON.parse(raw.toString());

      if (body.action === "sendMessage") {
        const sender = manager.get(ws);

        if (!sender) return;
        await controller.sendMessage(body.message, sender);
      }
    });

    ws.on("close", () => {
      manager.remove(ws);
    });
  });
}
