"use client";
import VideoList from "@/components/videolist";
import { useUser } from "@/context/user_provider";
import { useVideo } from "@/context/video_provider";
import { VideoImages, VideoType } from "@/types/video.types";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
export default function WatchLater() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const { getWatchLater } = useUser();
  const { getVideoFiles, removeFromWatchLater } = useVideo();
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getWatchLater();
        if (!response) return;
        const videoIds = response.map((video) => video.id);
        const videoFiles: VideoImages[] | null = await getVideoFiles(videoIds);
        if (!videoFiles || videoFiles.length === 0) return;

        const newVideos = response.map((video, idx) => ({
          ...video,
          thumbnail: videoFiles[idx]?.thumbnail,
          videoUrl: videoFiles[idx]?.video,
          guildAvatar: videoFiles[idx]?.avatar,
        }));
        setVideos(newVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, []);
  const deleteFromWatchLater = async (videoId: string | undefined) => {
    if(!videoId) return
    const response = await removeFromWatchLater(videoId);
    if (!response) return;
    const newVideos = videos.filter((video) => video.id !== videoId);
    setVideos(newVideos);
  }
  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="flex items-end gap-4">
        <Clock size={40} />
        <h1 className="text-5xl font-bold">Watch Later</h1>
      </div>

      <hr className="border-t border-red-700 my-4" />
      <VideoList videos={videos} listname="Watch Later" deleteFromList={deleteFromWatchLater}/>
    </div>
  );
}
