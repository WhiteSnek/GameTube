"use client";
import Chat from "@/components/guilds/chat";
import ChatProvider from "@/context/chat_provider";
import { useGuild } from "@/context/guild_provider";
import { JoinedGuildType } from "@/types/guild.types";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

export default function Subscriptions() {
  const [guilds, setGuilds] = useState<JoinedGuildType[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<JoinedGuildType | null>(
    null,
  );

  const { getJoinedGuilds, getGuildAvatars } = useGuild();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const guildResponse = await getJoinedGuilds()

        if (guildResponse && guildResponse.length > 0) {
          const guildIds = guildResponse.map((guild) => guild.id);
          const avatarUrls = await getGuildAvatars(guildIds);

          const updatedGuilds = guildResponse.map((guild, idx) => ({
            ...guild,
            avatar: avatarUrls?.[idx] || guild.avatar,
          }));

          setGuilds(updatedGuilds);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative">
      <div className="px-10">
        <div className="flex h-[calc(100vh-100px)] gap-4">

          <div className="w-1/5 min-w-[220px] flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden">
            <h1 className="text-lg font-bold text-center py-4 bg-zinc-300 dark:bg-zinc-900">
              Guilds
            </h1>

            <div className="flex-1 overflow-y-auto">
              {guilds.length === 0 && (
                <p className="text-center text-sm text-zinc-500 mt-6 px-4">
                  You haven&apos;t joined any guilds yet.
                </p>
              )}

              {guilds.map((guild) => {
                const isActive = selectedGuild?.id === guild.id;

                return (
                  <button
                    key={guild.id}
                    onClick={() => setSelectedGuild(guild)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition
                      ${
                        isActive
                          ? "bg-red-500/10 border-l-4 border-red-500"
                          : "border-l-4 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700/50"
                      }`}
                  >
                    {guild.avatar ? (
                      <img
                        src={guild.avatar}
                        alt={guild.name}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-zinc-400 dark:bg-zinc-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {guild.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate text-zinc-900 dark:text-white">
                        {guild.name}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize truncate">
                        {guild.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            {selectedGuild ? (
              <ChatProvider key={selectedGuild.id}>
                <Chat guildId={selectedGuild.id} />
              </ChatProvider>
            ) : (
              <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg text-zinc-500">
                <MessageSquare size={48} className="mb-3 opacity-50" />
                <p className="text-sm">
                  Select a guild to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}