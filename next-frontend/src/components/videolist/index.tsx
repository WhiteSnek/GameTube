'use client'
import React, { useState } from "react";
import { HoverThumbnail } from "../ui/card-hover-effect";
import Link from "next/link";
import { VideoType } from "@/types/video.types";
import formatDate from "@/utils/formatDate";
import formatViews from "@/utils/formatViews";
import Image from "next/image";
import { MoreVertical } from "lucide-react"; 
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"; 

const VideoList: React.FC<{ videos: VideoType[]; listname: string; deleteFromList: (videoId: string | undefined) => void }> = ({ videos, listname, deleteFromList }) => {
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

          {/* Video Details */}
          <div className="flex flex-col justify-between flex-1 space-y-2">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                {video.title}
              </h3>

              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatViews(video.views)} views • {formatDate(video.uploadDate)}
              </p>
            </div>

            {/* Guild Info */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-9 h-9 relative rounded-full overflow-hidden border border-gray-300 dark:border-zinc-600">
                <Image
                  src={video.guildAvatar}
                  alt={`${video.guildName} avatar`}
                  fill
                  className="object-cover"
                />
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
          </div>

          {/* Three Dots Icon with Dropdown */}
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    deleteFromList(listname === "History" ? video.entityId : video.id);
                  }}
                >
                  Remove from {listname}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoList;