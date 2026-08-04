import { WebSocket } from "ws";

export interface Client extends ChatUserContext {
  ws: WebSocket;
}

export interface ClientMessage {
  action: string;
  message: string;
}

export interface Connection extends ChatUserContext {
  connectionId: string;
}

export interface ChatUserContext {
  guildId: string;
  userId: string;
}

export interface ChatEvent {
  event: string;
  payload: Chat;
}

export interface UserDetails {
  fullname: string;
  avatar: string;
  guild_id: string;
  role: string;
}

export interface Chat {
  id: string | null;
  content: string;
  message_type: string;
  reply_to: string | null;
  created_at: string;
  updated_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  fullname: string;
  avatar: string;
  role: string;
}

export const MessageType = {
  TEXT: 0,
  GIF: 1,
} as const;

export const MessageTypeLabel: Record<number, string> = {
  [MessageType.TEXT]: "text",
  [MessageType.GIF]: "gif",
};

export const MessageTypeValue = {
  text: MessageType.TEXT,
  gif: MessageType.GIF,
} as const;