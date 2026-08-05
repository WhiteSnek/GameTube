import { WebSocket } from "ws";
import { Client } from "../types";

export class ClientManager {
  private clients = new Map<WebSocket, Client>();

  add(client: Client) {
    this.clients.set(client.ws, client);
  }

  remove(ws: WebSocket) {
    this.clients.delete(ws);
  }

  get(ws: WebSocket): Client | undefined {
    return this.clients.get(ws);
  }

  getUserClient(userId: string, guildId: string): Client | undefined {
    return [...this.clients.values()].find(
      (client) => client.userId === userId && client.guildId === guildId,
    );
  }

  getGuildClients(guildId: string) {
    return [...this.clients.values()].filter((c) => c.guildId === guildId);
  }
}
