import { WebSocket } from "ws";
import { Publisher } from "./publisher";
import { ChatEvent } from "../types";
import { ClientManager } from "../websocket/client.manager";

export class WebSocketPublisher implements Publisher {
  constructor(private clientManager: ClientManager) {}

  async publishToGuild(guildId: string, event: ChatEvent) {
    const clients = this.clientManager.getGuildClients(guildId);

    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(event));
      }
    }
  }

  async publishToUser(userId: string, guildId: string, event: ChatEvent) {
    const client = this.clientManager.getUserClient(userId, guildId);
    if (!client) return;

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(event));
    }
  }
}
