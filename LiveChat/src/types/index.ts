import { WebSocket } from "ws";

export interface Client {
  ws: WebSocket;
  userId: string;
  fullName: string;
  guildId: string;
}

export interface ClientMessage {
  action: string;
  message: string;
}

export interface ChatEvent {
  event: string;
  payload: unknown;
}