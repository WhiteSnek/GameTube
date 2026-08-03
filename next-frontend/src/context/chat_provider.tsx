"use client";

import api from "@/lib/axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";

export interface ChatMessage {
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  replyTo?: string | null;
}

interface ChatContextType {
  connectToChat: (guildId: string) => Promise<void>;
  send: (payload: unknown) => void;
  disconnect: () => void;
  messages: ChatMessage[];
  clearMessages: () => void;
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
  const getChatToken = async (guildId: string): Promise<string> => {
    const response = await api.get(`/auth/chat-token?guildId=${guildId}`);
    return response.data.token;
  };

  const connectToChat = async (guildId: string) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            action: "joinGuild",
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
        `ws://localhost:8080?token=${encodeURIComponent(token)}`,
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to chat server");
        ws.send(
          JSON.stringify({
            action: "joinGuild",
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

  const send = (message: string) => {
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
      }),
    );
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
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
        disconnect,
        messages,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
