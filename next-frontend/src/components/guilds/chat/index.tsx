"use client";
import { useChat } from "@/context/chat_provider";
import { Pencil, Send, Smile } from "lucide-react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const input = inputRef.current;

    if (!input) {
      setNewMessage((prev) => prev + emojiData.emoji);
      return;
    }

    const start = input.selectionStart ?? newMessage.length;
    const end = input.selectionEnd ?? newMessage.length;

    const updated =
      newMessage.slice(0, start) + emojiData.emoji + newMessage.slice(end);

    setNewMessage(updated);

    requestAnimationFrame(() => {
      input.focus();

      const cursor = start + emojiData.emoji.length;

      input.setSelectionRange(cursor, cursor);
    });
  };

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
        {messages.map((msg) => {
          const createdAt = new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={msg.id} className="flex gap-3 py-2">
              <img
                src={msg.avatar}
                alt={msg.fullname}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                    {msg.fullname}
                  </span>

                  <span className="text-[11px] px-2 py-0.5 rounded bg-red-500 text-white font-medium">
                    {msg.role}
                  </span>

                  <span className="text-xs text-zinc-500">{createdAt}</span>

                  {msg.edited_at && (
                    <Pencil
                      size={12}
                      className="text-zinc-400"
                      strokeWidth={2}
                    />
                  )}
                </div>

                {msg.deleted_at ? (
                  <p className="text-sm italic text-zinc-500 mt-1">
                    This message was deleted
                  </p>
                ) : (
                  <p className="mt-1 text-sm break-words text-zinc-800 dark:text-zinc-200">
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
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
        className="relative flex items-center gap-2 p-2"
        onSubmit={sendMessage}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            <Smile size={22} />
          </button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 z-50"
            >
              <EmojiPicker
                theme={Theme.DARK}
                emojiStyle={EmojiStyle.NATIVE}
                lazyLoadEmojis
                searchDisabled={false}
                skinTonesDisabled
                onEmojiClick={handleEmojiClick}
              />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 rounded-lg bg-zinc-300 dark:bg-zinc-900 px-3 py-2 focus:outline-none"
        />

        <button
          type="submit"
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-700"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
