"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Radio, Upload } from "lucide-react";

import CreateGuild from "@/components/create_guild";
import Chat from "@/components/guilds/chat";
import Details from "@/components/guilds/details";
import UploadVideo from "@/components/upload_video";
import { VideoCards } from "@/components/video_cards";

import { useGuild } from "@/context/guild_provider";
import { useVideo } from "@/context/video_provider";
import { VideoType } from "@/types/video.types";
export default function Guild() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const { Guild, getGuild } = useGuild();
  const { getVideos } = useVideo();
  const params = useParams();
  const guildId = Array.isArray(params.guildId) ? params.guildId[0] : params.guildId;
  // Fetch guild details
  useEffect(() => {
    if (!guildId) return;
    getGuild(guildId !== "1" ? guildId : undefined);
  }, [guildId]);

  // Fetch videos when the guild is available
  useEffect(() => {
    if (!Guild?.id) return;

    const fetchVideos = async () => {
      try {
        const response = await getVideos(Guild.id);
        setVideos(response);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [Guild?.id]);

  // If the guild does not exist, show the guild creation screen
  if (!Guild) return <CreateGuild />;

  return (
    <div className="relative flex justify-between px-6 py-2">
      <div className="flex-1 max-w-4xl h-[calc(100vh-100px)] overflow-y-scroll px-4">
        <Details guild={Guild} />

        {/* Guild Videos Header with Upload Button */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-3xl font-bold">Guild Videos</h1>
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-red-500 flex justify-center items-center gap-2 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer transition"
            >
              <Upload /> Upload
            </button>
            <UploadVideo
              open={isUploadOpen}
              onClose={() => setIsUploadOpen(false)}
              guildName={Guild.name}
              guildId={Guild.id}
            />
            <button className="bg-red-500 flex justify-center items-center gap-2 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer transition">
              <Radio /> Go Live
            </button>
          </div>
        </div>

        <hr className="border-t border-red-700 mx-4" />
        <VideoCards videos={videos} />
      </div>

      <Chat />
    </div>
  );
}
