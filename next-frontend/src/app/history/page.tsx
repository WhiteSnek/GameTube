"use client";

import VideoList from "@/components/videolist";
import { useUser } from "@/context/user_provider";
import { useVideo } from "@/context/video_provider";
import { HistoryType, VideoImages, VideoType } from "@/types/video.types";
import { HistoryIcon, MoreVertical } from "lucide-react"; // Importing MoreVertical icon
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // Importing shadcn dropdown components

export default function History() {
  const [history, setHistory] = useState<HistoryType>({});
  const { getHistory, clearHistory } = useUser();
  const { getVideoFiles, removeFromHistory } = useVideo();

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await getHistory();
      if (!response) return;
  
      const allVideos: (VideoType & { viewedDate: string })[] = [];
      Object.entries(response).forEach(([date, videos]) => {
        videos.forEach((video) => {
          allVideos.push({ ...video, viewedDate: date });
        });
      });
  
      const videoIds = allVideos.map((video) => video.id);
      const videoFiles: VideoImages[] | null = await getVideoFiles(videoIds);
      if (!videoFiles || videoFiles.length === 0) return;
  
      const enrichedVideos = allVideos.map((video, idx) => ({
        ...video,
        thumbnail: videoFiles[idx]?.thumbnail,
        videoUrl: videoFiles[idx]?.video,
        guildAvatar: videoFiles[idx]?.avatar,
      }));
  
      const groupedByDate: HistoryType = {};
      enrichedVideos.forEach((video) => {
        if (!groupedByDate[video.viewedDate]) {
          groupedByDate[video.viewedDate] = [];
        }
        groupedByDate[video.viewedDate].push(video);
      });
  
      const parseDDMMYYYY = (dateStr: string) => {
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day).getTime(); // month is 0-indexed
      };
      
      const sortedHistory: HistoryType = Object.fromEntries(
        Object.entries(groupedByDate).sort(
          ([dateA], [dateB]) => parseDDMMYYYY(dateB) - parseDDMMYYYY(dateA)
        )
      );
  
      setHistory(sortedHistory);
    };
  
    fetchHistory();
  }, []);
  


  const deleteFromHistory = async (entityId: string | undefined) => {
    if (!entityId) return;
    const response = await removeFromHistory(entityId);
    if (!response) return;
    const newHistory = { ...history };
    Object.entries(newHistory).forEach(([date, videos]) => {
      newHistory[date] = videos.filter((video) => video.entityId !== entityId);
    });
    setHistory(newHistory);
  };

  const handleClearHistory = async () => {
    const response = await clearHistory();
    if (!response) return;
    setHistory({});
  };

  return (
    <div className="relative max-w-6xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between gap-4"
      >
        <div className="flex items-end gap-4">
          <HistoryIcon size={40} />
          <h1 className="text-5xl font-bold">Watch History</h1>
        </div>

        {/* Three Dots Icon with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
              <MoreVertical className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleClearHistory();
              }}
            >
              Clear History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <hr className="border-t border-red-700 my-6" />

      <div className="space-y-12">
        {Object.keys(history).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-80 text-center text-gray-600"
          >
            <HistoryIcon className="w-12 h-12 text-gray-400" />
            <h2 className="text-xl font-semibold mt-3">
              You haven’t watched any videos yet!
            </h2>
            <p className="text-gray-500 mt-1">
              Start watching to see your history here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {Object.entries(history).map(
              ([date, videos]: [string, VideoType[]]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-zinc-900 p-5 rounded-2xl shadow-lg"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-zinc-200 mb-4 border-b border-zinc-700 pb-2">
                    {date}
                  </h2>
                  <VideoList
                    videos={videos}
                    listname="History"
                    deleteFromList={deleteFromHistory}
                  />
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
