"use client";
import GuildList from "@/components/guild_list";
import VideoList from "@/components/videolist";
import { useVideo } from "@/context/video_provider";
import { VideoImages, VideoType } from "@/types/video.types";
import { SearchCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [videos, setVideos] = useState<VideoType[]>([])
  const { searchVideos, getVideoFiles } = useVideo();
  useEffect(() => {
    const fetchVideos = async () => {
      if (!query) return;

      try {
        const response = await searchVideos(query);
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
        console.error("Error fetching guilds:", error);
      }
    };

    fetchVideos();
  }, [query]);
  if(videos.length === 0) return <div>Loading...</div>
  return (
    <div className="relative max-w-5xl mx-auto">
    <div className="flex items-end gap-4">
      <SearchCheck size={40} />
      <h1 className="text-5xl font-bold">Search Results</h1>
    </div>
    <hr className="border-t border-red-700 my-4" />
    <VideoList videos={videos} />
  </div>

  );
}
