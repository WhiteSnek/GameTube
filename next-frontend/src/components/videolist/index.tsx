'use client'
import React from "react";
import { HoverThumbnail } from "../ui/card-hover-effect";
import Link from "next/link";
import { VideoType } from "@/types/video.types";
import formatDate from "@/utils/formatDate";

const VideoList: React.FC<{ videos: VideoType[] }> = ({ videos }) => {
  console.log(videos)
  return (
    <div className="space-y-4">
      {videos.map((video, index) => (
        <Link
          key={index}
          href={`/video/${video.id}`}
          className="group flex gap-4 p-4 rounded-xl bg-white/60 dark:bg-zinc-900/50 hover:shadow-lg transition-all hover:scale-[1.01] duration-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
        >
          {/* Thumbnail with Duration */}
          <div className="relative w-52 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <HoverThumbnail
              thumbnail={video.thumbnail}
              duration={video.duration.toString()}
              video={video.videoUrl}
            />
          </div>

          {/* Video Details */}
          <div className="flex flex-col justify-center flex-1 space-y-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 ">
              {video.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {video.guildName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              X views • {formatDate(video.uploadDate)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoList;
