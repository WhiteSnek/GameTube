"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchCheck } from "lucide-react";

import VideoList from "@/components/videolist";
import { useVideo } from "@/context/video_provider";
import { VideoImages, VideoType } from "@/types/video.types";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const { searchVideos, getVideoFiles } = useVideo();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!query) return;

      try {
        const response = await searchVideos(query);
        if (!response || response.length === 0) {
          setVideos([]);
          return;
        }

        const videoIds = response.map((video) => video.id);
        const videoFiles: VideoImages[] | null = await getVideoFiles(videoIds);

        if (!videoFiles || videoFiles.length === 0) {
          setVideos([]);
          return;
        }

        const enrichedVideos = response.map((video, idx) => ({
          ...video,
          thumbnail: videoFiles[idx]?.thumbnail,
          videoUrl: videoFiles[idx]?.video,
          guildAvatar: videoFiles[idx]?.avatar,
        }));

        setVideos(enrichedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      }
    };

    fetchVideos();
  }, [query, searchVideos, getVideoFiles]);

  if (videos === null) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl">No videos found for "{query}"</h2>
      </div>
    );
  }

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
