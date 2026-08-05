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
  role: string;
}

export interface ChatEvent {
  event: string;
  payload: Chat | Error;
}

export interface UserDetails {
  fullname: string;
  avatar: string;
  guild_id: string;
  role: string;
}

export interface ReplyToPreview {
  id: string;
  fullname: string;
  content: string | null;
  deleted: boolean;
}

export interface Chat {
  id: string | null;
  content: string;
  message_type: string;
  reply_to: ReplyToPreview | null;
  created_at: string;
  updated_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  deleted_by_name: string | null;
  fullname: string;
  avatar: string;
  role: string;
}

export interface Error {
  code: string;
  message: string;
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