"use client";

import { api, liveChatApi } from "@/lib/axios";
import { toast } from "sonner";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";

export interface ReplyToPreview {
  id: string;
  fullname: string;
  content: string | null;
  deleted: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  messageType: "text" | "gif";
  reply_to?: ReplyToPreview | null;
  created_at: string;
  updated_at: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deleted_by_name?: string | null;
  fullname: string;
  avatar: string;
  role: string;
}

export interface ChatError {
  code: string;
  message: string;
}

export interface ChatEvent {
  event: string;
  payload: ChatMessage | ChatError;
}

interface ChatContextType {
  connectToChat: (guildId: string) => Promise<void>;
  send: (
    message: string,
    messageType: "text" | "gif",
    replyTo: string | null,
  ) => void;
  editMessage: (
    chatId: string,
    content: string,
    messageType?: "text" | "gif",
  ) => void;
  deleteMessage: (chatId: string) => void;
  getLastReadMessageDetails: (
    guildId: string,
  ) => Promise<{ last_read_message_id: string; last_read_at: string } | null>;
  getUnreadMessageCount: (guildId: string) => Promise<{ count: number }>;
  updateLastRead: (chatId: string) => void;
  disconnect: () => void;
  messages: ChatMessage[];
  clearMessages: () => void;
  onlineUsers: number;
  startTyping: () => void;
  typing: boolean;
  typingUser: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [typing, setTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingResetRef = useRef<NodeJS.Timeout | null>(null);
  const getChatToken = async (guildId: string): Promise<string> => {
    const response = await api.get(`/auth/chat-token?guildId=${guildId}`);
    return response.data.token;
  };

  const connectToChat = async (guildId: string) => {
    try {
      const history = await liveChatApi.get(`/chat?guildId=${guildId}`);
      setMessages(history.data);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            action: "getOnlineUsers",
            guildId,
          }),
        );
        return;
      }
      if (wsRef.current) {
        wsRef.current.close();
      }

      const token = await getChatToken(guildId);

      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_LIVE_CHAT_WEBSOCKET_API}?token=${encodeURIComponent(token)}`,
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to chat server");
        ws.send(
          JSON.stringify({
            action: "getOnlineUsers",
            guildId,
          }),
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log("Received:", data);

        switch (data.event) {
          case "MESSAGE_RECEIVED":
            setMessages((prev) => [...prev, data.payload]);
            break;
          case "MESSAGE_UPDATED":
            setMessages((prev) =>
              prev.map((message) =>
                message.id === data.payload.id
                  ? {
                      ...message,
                      ...data.payload,
                    }
                  : message,
              ),
            );
            break;
          case "MESSAGE_DELETED":
            setMessages((prev) =>
              prev.map((message) =>
                message.id === data.payload.id
                  ? {
                      ...message,
                      ...data.payload,
                    }
                  : message,
              ),
            );
            break;
          case "ACTIVE_CONNECTION_COUNT":
            console.log("Active connections: ", data.payload);
            setOnlineUsers(data.payload);
            break;
          case "TYPING": {
            const payload = data.payload as { fullname?: string };

            setTyping(true);
            setTypingUser(payload?.fullname ?? null);

            if (typingResetRef.current) clearTimeout(typingResetRef.current);
            typingResetRef.current = setTimeout(() => {
              setTyping(false);
              setTypingUser(null);
            }, 3000);

            break;
          }
          case "UPDATE_LAST_READ": {
            const payload = data.payload as {chatId?: string};
            console.log("Last read updated:", payload?.chatId);
            break;
          }
          case "ERROR": {
            const error = data.payload as ChatError;

            toast.error(error.code, {
              description: error.message,
            });

            break;
          }

          default:
            console.log("Unknown event:", data.event);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
      };

      ws.onclose = () => {
        console.log("Disconnected from chat server");
        wsRef.current = null;
      };
    } catch (error) {
      console.error("Failed to connect to chat:", error);
    }
  };

  const send = (
    message: string,
    messageType: "text" | "gif",
    replyTo: string | null,
  ) => {
    if (!wsRef.current) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        action: "sendMessage",
        message,
        messageType,
        replyTo,
      }),
    );
  };

  const editMessage = (
    chatId: string,
    content: string,
    messageType: "text" | "gif" = "text",
  ) => {
    if (!wsRef.current) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        action: "editMessage",
        chatId,
        content,
        messageType,
      }),
    );
  };

  const deleteMessage = (chatId: string) => {
    if (!wsRef.current) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        action: "deleteMessage",
        chatId,
      }),
    );
  };

  const getLastReadMessageDetails = async (guildId: string) => {
    const token = await getChatToken(guildId);

    const response = await liveChatApi.get("/chat/unread", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const getUnreadMessageCount = async (guildId: string) => {
    const token = await getChatToken(guildId);

    const response = await liveChatApi.get(
      `/chat/unread-count?guildId=${guildId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };

  const startTyping = () => {
    if (!wsRef.current) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        action: "startTyping",
      }),
    );
  };

  const updateLastRead = (chatId: string) => {
    if (!wsRef.current) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        action: "updateLastRead",
        chatId,
      }),
    );
  }

  const clearMessages = () => {
    setMessages([]);
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (typingResetRef.current) {
      clearTimeout(typingResetRef.current);
      typingResetRef.current = null;
    }
  };

  const isConnected = () => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        connectToChat,
        send,
        editMessage,
        deleteMessage,
        getLastReadMessageDetails,
        getUnreadMessageCount,
        updateLastRead,
        disconnect,
        messages,
        clearMessages,
        onlineUsers,
        startTyping,
        typing,
        typingUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
