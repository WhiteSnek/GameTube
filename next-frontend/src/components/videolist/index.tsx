'use client'
import React from "react";
import { HoverThumbnail } from "../ui/card-hover-effect";
import Link from "next/link";

interface Video {
  id: number;
  video_title: string;
  thumbnail_link: string;
  video_link: string;
  video_duration: string;
  views: string;
  upload_time: string;
  channel_name: string;
}

const VideoList: React.FC<{ videos: Video[] }> = ({ videos }) => {
  return (
    <div className="space-y-3 ">
      {videos.map((video, index) => (
        <Link
          key={index}
          href={`/video/${video.id}`}
          className="flex gap-3 p-2 rounded-lg hover:bg-gray-300/80 dark:hover:bg-zinc-800/80 transition"
        >
          {/* Thumbnail with Duration */}
          <div className="relative w-52 h-28 flex-shrink-0">
            <HoverThumbnail
              thumbnail={video.thumbnail_link}
              duration={video.video_duration}
              video={video.video_link}
            />
          </div>

          {/* Video Details */}
          <div className="flex flex-col justify-center flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {video.video_title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {video.channel_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {video.views} views • {video.upload_time}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoList;
