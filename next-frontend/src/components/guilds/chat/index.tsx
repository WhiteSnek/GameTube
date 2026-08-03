"use client";
import { useChat } from "@/context/chat_provider";
import { Send } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface ChatProps {
  guildId: string;
}

const Chat: React.FC<ChatProps> = ({ guildId }) => {
  const { connectToChat, send, messages, clearMessages } = useChat();
  useEffect(() => {
    clearMessages();
    connectToChat(guildId);
  }, [guildId]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const content = newMessage.trim();

    if (!content) return;

    send(content);

    setNewMessage("");
};

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Hide typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="h-[calc(100vh-100px)] w-1/4 flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg ">
      <h1 className="text-lg font-bold text-center py-4 bg-zinc-300 dark:bg-zinc-900 rounded-t-xl">
        Live Chat
      </h1>
      <div className="flex-1 overflow-y-auto p-2 dark:bg-zinc-800 bg-zinc-100 px-4">
        {messages.map((msg, idx) => (
          <div key={`${msg.senderId}-${msg.createdAt}-${idx}`} className="flex items-center">
            <img
              src={msg.senderAvatar}
              alt={msg.senderName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className=" p-3 rounded-lg w-full">
              <p className="text-sm font-bold">{msg.senderName}</p>
              <p className="text-xs text-gray-500">{msg.senderRole}</p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="text-xs">Someone is typing...</span>
            <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full delay-75"></div>
            <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full delay-150"></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <form
        className="flex items-center p-2  rounded-lg"
        onSubmit={(e) => sendMessage(e)}
      >
        <input
          type="text"
          className="flex-1 p-2 border-none rounded-lg focus:outline-none dark:bg-zinc-900 bg-zinc-300 placeholder-gray-400"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
        />
        <button
          className="ml-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer transition"
          type="submit"
        >
          <Send />
        </button>
      </form>
    </div>
  );
};

export default Chat;
