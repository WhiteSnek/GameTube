"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Radio, Upload } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import CreateGuild from "@/components/create_guild";
import Chat from "@/components/guilds/chat";
import ChatProvider from "@/context/chat_provider";
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
  const searchParams = useSearchParams();
  const guildId = searchParams.get("guildId");
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
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[calc(100vh-80px)] px-6 py-2"
    >
      <ResizablePanel defaultSize={72} minSize={50}>
        <div className="h-full overflow-y-auto pr-4">
          <Details guild={Guild} />

          <div className="flex items-center justify-between p-4">
            <h1 className="text-3xl font-bold">Guild Videos</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-700"
              >
                <Upload />
                Upload
              </button>

              <UploadVideo
                open={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                guildName={Guild.name}
                guildId={Guild.id}
              />

              <button className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-700">
                <Radio />
                Go Live
              </button>
            </div>
          </div>

          <hr className="mx-4 border-t border-red-700" />

          <VideoCards videos={videos} />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
        <div className="h-full pl-4">
          <ChatProvider>
            <Chat guildId={Guild.id} />
          </ChatProvider>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
