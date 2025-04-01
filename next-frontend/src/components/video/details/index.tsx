"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Download, Share2 } from "lucide-react";
import { VideoDetailstype } from "@/types/video.types";
import formatDate from "@/utils/formatDate";
interface VideoDetailsProps {
  video: VideoDetailstype
}
const VideoDetails: React.FC<VideoDetailsProps> = ({video}) => {
  return (
    <div className="p-6 mt-4 w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg">
      {/* Video Title */}
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
       {video.title}
      </h1>

      {/* Channel Info */}
      <div className="flex items-center gap-4 mt-3">
        <img
          src={video.guildAvatar}
          alt="Channel Avatar"
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            {video.guildName} · <span className="text-zinc-500 font-normal">posted by {video.ownerName}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">1.2M Subscribers</p>
        </div>
        <Button className="ml-auto bg-red-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-red-700">
          Subscribe
        </Button>
      </div>

      {/* Video Details */}
      <div className="mt-4">
        <p className="text-gray-600 dark:text-gray-300">
          1.5M views • Uploaded on {formatDate(video.uploadDate)}
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {video.description}
        </p>
        {/* Tags */}
        <div className="mt-2 flex gap-2">
          {video.tags.map((tag,idx)=>(
            <span key={idx} className="bg-red-500 px-2 py-1 rounded-full text-sm">
            #{tag}
          </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <Button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <ThumbsUp size={18} /> 32K
        </Button>
        <Button className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          <Download size={18} /> Download
        </Button>
        <Button className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          <Share2 size={18} /> Share
        </Button>
      </div>
    </div>
  );
};

export default VideoDetails;
