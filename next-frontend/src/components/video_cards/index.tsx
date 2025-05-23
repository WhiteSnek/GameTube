"use client";
import { useEffect, useState } from "react";
import { VideoHoverEffect } from "../ui/card-hover-effect";
import { VideoImages, VideoType } from "@/types/video.types";
import { useVideo } from "@/context/video_provider";
import { VideoOff } from "lucide-react";

export function VideoCards({
  videos,
  showAvatar,
}: {
  videos: VideoType[];
  showAvatar?: boolean;
}) {
  const { getVideoFiles } = useVideo();
  const [updatedVideos, setUpdatedVideos] = useState<VideoType[]>(videos);

  useEffect(() => {
    if (!videos || videos.length === 0) return;

    const fetchVideoFiles = async () => {
      try {
        const videoIds = videos.map((video) => video.id);
        const videoFiles: VideoImages[] = await getVideoFiles(videoIds);

        if (!videoFiles || videoFiles.length === 0) return;

        const newVideos = videos.map((video, idx) => ({
          ...video,
          thumbnail: videoFiles[idx]?.thumbnail,
          videoUrl: videoFiles[idx]?.video,
          guildAvatar: videoFiles[idx]?.avatar,
        }));

        setUpdatedVideos(newVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideoFiles();
  }, [videos, getVideoFiles]);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-gray-600">
        <VideoOff className="w-16 h-16 mb-4 text-gray-400 animate-pulse" />
        <h2 className="text-2xl font-semibold">No videos to display</h2>
        <p className="text-gray-500 mt-2">Subscribe to a guild or upload your own videos!</p>
      </div>
    );
  }

  return (
    <div className="px-8">
      <VideoHoverEffect items={updatedVideos} showAvatar={showAvatar} />
    </div>
  );
}
