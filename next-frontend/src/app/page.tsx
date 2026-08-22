"use client";
import { useEffect, useState } from "react";
import { VideoCards } from "@/components/video_cards";
import { useVideo } from "@/context/video_provider";
import { VideoType } from "@/types/video.types";
import { VideoGridSkeleton } from "@/components/skeletons";

export default function Home() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { getVideos } = useVideo();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getVideos();
        setVideos(response);
      } finally {
        setIsReady(true);
      }
    };

    fetchVideos();
  }, []);

  if (!isReady) {
    return <VideoGridSkeleton />;
  }

  return (
    <div>
      <VideoCards videos={videos} showAvatar />
    </div>
  );
}
