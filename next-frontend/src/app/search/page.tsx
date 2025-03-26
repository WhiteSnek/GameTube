"use client";
import GuildList from "@/components/guild_list";
import { useGuild } from "@/context/guild_provider";
import { GuildsType } from "@/types/guild.types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [guilds, setGuilds] = useState<GuildsType[] | null>(null);
  const { searchGuilds, getGuildAvatars } = useGuild();
  useEffect(() => {
    const fetchGuilds = async () => {
      if (!query) return;
  
      try {
        // Fetch guilds based on query
        const response = await searchGuilds(query);
        if (!response || response.length === 0) return;
  
        // Extract guild IDs
        const guildIds = response.map((guild) => guild.id);
        if (guildIds.length === 0) return;
  
        // Fetch avatar URLs
        const avatarUrls = await getGuildAvatars(guildIds);
        if (!avatarUrls || avatarUrls.length === 0) return;
  
        // Merge avatars with guild data
        const updatedGuilds = response.map((guild, idx) => ({
          ...guild,
          avatar: avatarUrls[idx] || guild.avatar, // Fallback to existing avatar
        }));
  
        setGuilds(updatedGuilds);
      } catch (error) {
        console.error("Error fetching guilds:", error);
      }
    };
  
    fetchGuilds();
  }, [query]);
  
  return (
    <div className="relative">{guilds && <GuildList guilds={guilds} />}</div>
    //
  );
}
