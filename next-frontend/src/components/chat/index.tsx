"use client";
import { ChatMessage, useChat } from "@/context/chat_provider";
import {
  Pencil,
  Send,
  Smile,
  MoreHorizontal,
  Trash2,
  Reply,
  X,
  Hash,
} from "lucide-react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { JoinedGuildType } from "@/types/guild.types";
import ChatDetails from "./Details";

interface ChatProps {
  guild: JoinedGuildType;
}

type MessageType = "text" | "gif";

type MessageGroup = {
  date: string;
  messages: ChatMessage[];
};

interface ReplyTarget {
  id: string;
  fullname: string;
  content: string;
}

interface LastReadDetails {
  last_read_message_id: string;
  last_read_at: string;
}

const Chat: React.FC<ChatProps> = ({ guild }) => {
  const {
    connectToChat,
    send,
    editMessage,
    deleteMessage,
    getLastReadMessageDetails,
    messages,
    clearMessages,
    startTyping,
    typing,
    typingUser,
  } = useChat();

  const lastTypingSentRef = useRef<number>(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null);

  const [lastReadDetails, setLastReadDetails] =
    useState<LastReadDetails | null>(null);
  const [hasLoadedLastRead, setHasLoadedLastRead] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const unreadDividerRef = useRef<HTMLDivElement | null>(null);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearMessages();
    connectToChat(guild.id);

    setHasLoadedLastRead(false);
    setLastReadDetails(null);
    setHasScrolledToUnread(false);

    const fetchLastRead = async () => {
      try {
        const details = await getLastReadMessageDetails(guild.id);
        setLastReadDetails(details);
      } finally {
        setHasLoadedLastRead(true);
      }
    };

    fetchLastRead();
  }, [guild.id]);

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

    const messageType: MessageType = "text";
    send(content, messageType, replyingTo ? replyingTo.id : null);

    setNewMessage("");
    setReplyingTo(null);
  };

  const startReply = (msg: ChatMessage) => {
    if (!msg.id) return;

    setReplyingTo({
      id: msg.id,
      fullname: msg.fullname,
      content: msg.content,
    });
    setOpenMenuId(null);
    inputRef.current?.focus();
  };

  const cancelReply = () => setReplyingTo(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      startTyping();
      lastTypingSentRef.current = now;
      chatEndRef.current.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    }
  };

  const firstUnreadMessageId = useMemo(() => {
    if (!hasLoadedLastRead) return null;
    if (!lastReadDetails) {
      return messages.length > 0 ? messages[0].id : null;
    }

    const lastReadIndex = messages.findIndex(
      (msg) => msg.id === lastReadDetails.last_read_message_id,
    );
    if (lastReadIndex === -1) {
      return messages.length > 0 ? messages[0].id : null;
    }

    const nextMessage = messages[lastReadIndex + 1];

    return nextMessage?.id ?? null;
  }, [messages, lastReadDetails, hasLoadedLastRead]);

  useEffect(() => {
    if (hasScrolledToUnread) return;
    if (!hasLoadedLastRead) return;

    if (!firstUnreadMessageId) {
      chatEndRef.current?.scrollIntoView();
      setHasScrolledToUnread(true);
      return;
    }

    if (!unreadDividerRef.current) return;

    unreadDividerRef.current.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });

    setHasScrolledToUnread(true);
  }, [hasLoadedLastRead, firstUnreadMessageId, hasScrolledToUnread]);

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupedMessages = messages.reduce<MessageGroup[]>((groups, message) => {
    const date = getDateLabel(new Date(message.created_at));

    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.date === date) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        date,
        messages: [message],
      });
    }

    return groups;
  }, []);

  return (
    <div className="h-[calc(100vh-100px)] w-full flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg ">
      <ChatDetails guild={guild} />
      <div className="flex-1 overflow-y-auto p-2 dark:bg-zinc-800 bg-zinc-100 px-4">
        {groupedMessages.map((group) => (
          <React.Fragment key={group.date}>
            <div className="relative my-4 flex items-center">
              <div className="flex-1 border-t border-zinc-300 dark:border-zinc-700" />

              <span className="mx-3 rounded-full bg-zinc-200 dark:bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-500">
                {group.date}
              </span>

              <div className="flex-1 border-t border-zinc-300 dark:border-zinc-700" />
            </div>

            {group.messages.map((msg) => {
              const createdAt = new Date(msg.created_at).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              const replyRef = msg.reply_to;
              const isFirstUnread =
                firstUnreadMessageId !== null &&
                msg.id === firstUnreadMessageId;

              return (
                <React.Fragment key={msg.id}>
                  {isFirstUnread && (
                    <div
                      ref={unreadDividerRef}
                      className="relative my-4 flex items-center"
                    >
                      <div className="flex-1 border-t border-red-500" />
                      <span className="mx-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                        New messages
                      </span>
                      <div className="flex-1 border-t border-red-500" />
                    </div>
                  )}

                  <div className="group relative flex gap-3 py-2 px-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30 transition">
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

                        <span className="text-xs text-zinc-500">
                          {createdAt}
                        </span>

                        {msg.edited_at && (
                          <Pencil size={12} className="text-zinc-500" />
                        )}
                      </div>
                      {replyRef &&
                        !msg.deleted_at &&
                        editingMessageId !== msg.id && (
                          <div className="mt-1 mb-1 border-l-2 border-red-500 pl-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            <span className="font-semibold">
                              {replyRef.fullname}
                            </span>
                            {": "}
                            {replyRef.deleted ? (
                              <span className="italic">message deleted</span>
                            ) : (
                              replyRef.content
                            )}
                          </div>
                        )}

                      {editingMessageId === msg.id ? (
                        <form
                          className="mt-2"
                          onSubmit={(e) => {
                            e.preventDefault();

                            const value = editedMessage.trim();

                            if (!value) return;

                            editMessage(msg.id, value);

                            setEditingMessageId(null);
                            setEditedMessage("");
                          }}
                        >
                          <input
                            autoFocus
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setEditingMessageId(null);
                                setEditedMessage("");
                              }
                            }}
                            className="w-full rounded-md border border-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-red-500"
                          />

                          <p className="mt-1 text-[11px] text-zinc-500">
                            Press <span className="font-semibold">Enter</span>{" "}
                            to save • <span className="font-semibold">Esc</span>{" "}
                            to cancel
                          </p>
                        </form>
                      ) : msg.deleted_at ? (
                        <p className="mt-1 text-sm italic text-zinc-500">
                          {`This message was deleted ${msg.deleted_by ? `by ${msg.deleted_by_name}` : ""}`}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm break-words text-zinc-800 dark:text-zinc-200">
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {/* Hover menu */}
                    <div className="absolute right-2 top-2">
                      <Popover
                        open={openMenuId === msg.id}
                        onOpenChange={(open) =>
                          setOpenMenuId(open ? msg.id : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          {!msg.deleted_at && (
                            <button
                              className={`
                            rounded-md p-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition
                            ${
                              openMenuId === msg.id
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }
                          `}
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          )}
                        </PopoverTrigger>

                        <PopoverContent
                          align="end"
                          sideOffset={8}
                          className="w-40 p-1 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        >
                          {!msg.deleted_at && (
                            <button
                              onClick={() => startReply(msg)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Reply size={15} />
                              Reply
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditedMessage(msg.content);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil size={15} />
                            Edit Message
                          </button>

                          <button
                            onClick={() => {
                              deleteMessage(msg.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Trash2 size={15} />
                            Delete Message
                          </button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))}
        {/* Typing Indicator */}
        {typing && (
          <div className="flex items-center gap-2 px-2 py-1 text-zinc-500 dark:text-zinc-400">
            <span className="text-xs">
              {typingUser
                ? `${typingUser} is typing...`
                : "Someone is typing..."}
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Reply preview bar, shown above the input when replying */}
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 mx-2 mb-1 px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 border-l-2 border-red-500">
          <div className="min-w-0 text-xs text-zinc-600 dark:text-zinc-300 truncate">
            Replying to{" "}
            <span className="font-semibold">{replyingTo.fullname}</span>
            {": "}
            {replyingTo.content}
          </div>
          <button
            type="button"
            onClick={cancelReply}
            className="p-1 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 transition flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

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
          placeholder={
            replyingTo
              ? `Replying to ${replyingTo.fullname}...`
              : "Type a message..."
          }
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
