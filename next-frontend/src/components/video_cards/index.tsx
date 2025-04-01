"use client";
import { useEffect, useState } from "react";
import { VideoHoverEffect } from "../ui/card-hover-effect";
import { VideoImages, VideoType } from "@/types/video.types";
import { useVideo } from "@/context/video_provider";

export function VideoCards({ videos, showAvatar }: { videos: VideoType[] | null; showAvatar?: boolean }) {
  const { getVideoFiles } = useVideo();
  const [updatedVideos, setUpdatedVideos] = useState<VideoType[] | null>(videos);

  useEffect(() => {
    if (!videos || videos.length === 0) return;

    const fetchVideoFiles = async () => {
      try {
        const videoIds = videos.map((video) => video.id);
        const videoFiles: VideoImages[] | null = await getVideoFiles(videoIds);

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

  if (!updatedVideos) return <div>Loading...</div>;

  return (
    <div className="px-8">
      <VideoHoverEffect items={updatedVideos} showAvatar={showAvatar} />
    </div>
  );
}
