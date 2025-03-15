"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Download, Share2 } from "lucide-react";

const VideoDetails: React.FC = () => {
  return (
    <div className="p-6 mt-4 w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg">
      {/* Video Title */}
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Awesome Video Title
      </h1>

      {/* Channel Info */}
      <div className="flex items-center gap-4 mt-3">
        <img
          src="https://i1.sndcdn.com/avatars-1F5ymBCxBLO7BeF6-FWifBQ-t1080x1080.jpg" 
          alt="Channel Avatar"
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            Channel Name
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
          1.5M views • Uploaded on March 10, 2025
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          This is a short video description giving an overview of the content.
        </p>
        {/* Tags */}
        <div className="mt-2 flex gap-2">
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-1 rounded-md text-sm">
            #tag1
          </span>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-1 rounded-md text-sm">
            #tag2
          </span>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-1 rounded-md text-sm">
            #tag3
          </span>
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
