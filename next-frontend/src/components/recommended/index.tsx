'use client'
import React, { JSX, useEffect, useState } from "react";
import { HoverThumbnail } from "../ui/card-hover-effect";
import Link from "next/link";
import { VideoImages, VideoType } from "@/types/video.types";
import formatDate from "@/utils/formatDate";
import formatViews from "@/utils/formatViews";
import Image from "next/image";
import { Ghost } from "lucide-react";
import { useVideo } from "@/context/video_provider";

const RecommendedVideoList: React.FC< {videoId: string}> = ({videoId}) => {
    const [videos, setVideos] = useState<VideoType[]>([]);
    const { getVideos, getVideoFiles } = useVideo()
    useEffect(()=>{
        const fetchVideos = async() =>{
          try {
            const response = await getVideos()
            if(!response) return
            const filteredVideos = response.filter((video) => video.id !== videoId)
            const videoIds = filteredVideos.map((video) => video.id);
            const videoFiles: VideoImages[] = await getVideoFiles(videoIds);
            if (!videoFiles || videoFiles.length === 0) return;
      
              const newVideos = filteredVideos.map((video, idx) => ({
                ...video,
                thumbnail: videoFiles[idx]?.thumbnail,
                videoUrl: videoFiles[idx]?.video,
                guildAvatar: videoFiles[idx]?.avatar,
              }));
            setVideos(newVideos)
          } catch (error) {
            console.error("Error fetching videos:", error);
          }
        }
        fetchVideos()
      },[])
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center text-gray-600">
        <Ghost className="w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-semibold mt-3">No videos to recommend!</h2>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video, index) => (
        <Link
          key={index}
          href={`/video/${video.id}`}
          className="group flex gap-4 p-4 rounded-xl bg-white/60 dark:bg-zinc-900/50 hover:shadow-lg transition-all hover:scale-[1.01] duration-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 relative"
        >
          <div className="relative w-52 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <HoverThumbnail
              thumbnail={video.thumbnail}
              duration={video.duration.toString()}
              video={video.videoUrl}
            />
          </div>
          <div className="flex flex-col justify-between flex-1 space-y-2">
            <div className="flex flex-col">
              <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {formatViews(video.views)} views • {formatDate(video.uploadDate)}
              </p>
            </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {video.guildName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  by {video.ownerName}
                </span>
              </div>
            </div>
        </Link>
      ))}
    </div>
  );
};

export default RecommendedVideoList;
