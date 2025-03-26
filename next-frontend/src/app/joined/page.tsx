'use client'
import SubscriptionList from "@/components/subscriptions";
import { VideoCards } from "@/components/video_cards";
import { useGuild } from "@/context/guild_provider";
import { JoinedGuildType } from "@/types/guild.types";
import { useEffect, useState } from "react";

export default function Subscriptions() {
  const [guilds, setGuilds] = useState<JoinedGuildType[] | null>(null);
  const { getJoinedGuilds, getGuildAvatars } = useGuild();
  useEffect(() => {
    const getGuilds = async () => {
      const response = await getJoinedGuilds();
      if (!response || response.length === 0) return;
      const guildIds = response.map((guild) => guild.id);
      if (guildIds.length === 0) return;

      const avatarUrls = await getGuildAvatars(guildIds);
      if (!avatarUrls || avatarUrls.length === 0) return;

      const updatedGuilds = response.map((guild, idx) => ({
        ...guild,
        avatar: avatarUrls[idx] || guild.avatar, 
      }));

      setGuilds(updatedGuilds);
    };
    getGuilds();
  }, []);
  if (!guilds) return;
  return (
    <div className="relative">
      <div className="px-10">
        <SubscriptionList guilds={guilds} />
        <h1 className="font-bold text-5xl mt-4">Latest</h1>
      </div>
      <VideoCards />
    </div>
    //
  );
}
