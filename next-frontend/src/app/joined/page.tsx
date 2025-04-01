"use client";
import SubscriptionList from "@/components/subscriptions";
import { VideoCards } from "@/components/video_cards";
import { useGuild } from "@/context/guild_provider";
import { useVideo } from "@/context/video_provider";
import { JoinedGuildType } from "@/types/guild.types";
import { VideoType } from "@/types/video.types";
import { useEffect, useState } from "react";

export default function Subscriptions() {
  const [guilds, setGuilds] = useState<JoinedGuildType[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  
  const { getJoinedGuilds, getGuildAvatars } = useGuild();
  const { getJoinedGuildVideos } = useVideo();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guildResponse, videoResponse] = await Promise.all([
          getJoinedGuilds(),
          getJoinedGuildVideos(),
        ]);

        if (guildResponse && guildResponse.length > 0) {
          const guildIds = guildResponse.map((guild) => guild.id);
          const avatarUrls = await getGuildAvatars(guildIds);

          const updatedGuilds = guildResponse.map((guild, idx) => ({
            ...guild,
            avatar: avatarUrls?.[idx] || guild.avatar,
          }));

          setGuilds(updatedGuilds);
        }

        if (videoResponse) {
          setVideos(videoResponse);
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
        {guilds.length > 0 && <SubscriptionList guilds={guilds} />}
        <h1 className="font-bold text-5xl mt-4">Latest</h1>
      </div>
      <VideoCards videos={videos} />
    </div>
  );
}
