import { useChat } from "@/context/chat_provider";
import { JoinedGuildType } from "@/types/guild.types";
import { Hash } from "lucide-react";
import React from "react";

interface ChatDetailsProps{
    guild: JoinedGuildType; 
}

const ChatDetails: React.FC<ChatDetailsProps> = ({guild}) => {
    const { onlineUsers } = useChat()
  return (
    <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-t-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
          {guild.avatar ? (
            <img
              src={guild.avatar}
              alt={guild.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <Hash className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight tracking-tight truncate">
            {guild.name}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            Discuss with everyone in this guild
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 text-sm text-zinc-600 dark:text-zinc-300 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">
          {onlineUsers.toLocaleString()}
        </span>
        <span className="text-zinc-400 dark:text-zinc-500">Online</span>
      </div>
    </div>
  );
};

export default ChatDetails;
