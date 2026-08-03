"use client";
import { useEffect, useState } from "react";
import { VideoCards } from "@/components/video_cards";
import { useVideo } from "@/context/video_provider";
import { VideoType } from "@/types/video.types";
import Chat from "@/components/guilds/chat";
import ChatProvider from "@/context/chat_provider";

export default function Home() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const { getVideos } = useVideo();

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await getVideos();
      setVideos(response);
    };
    fetchVideos();
  }, []);

  return (
    <div>
      {/* <VideoCards videos={videos} showAvatar /> */}
      <ChatProvider>
        <Chat guildId="5a2a4981-f936-46f1-bd3e-5a0c7d06f86e" />
      </ChatProvider>
    </div>
  );
}
