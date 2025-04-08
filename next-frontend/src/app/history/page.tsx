'use client'

import VideoList from "@/components/videolist";
import { useUser } from "@/context/user_provider";
import { useVideo } from "@/context/video_provider";
import { HistoryType, VideoImages, VideoType } from "@/types/video.types";
import { HistoryIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function History() {
  const [history, setHistory] = useState<HistoryType>({});
  const { getHistory } = useUser();
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

      setHistory(groupedByDate);
    };

    fetchHistory();
    
  }, []);
  console.log(history)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const deleteFromHistory = async (entityId: string | undefined) => {
    if(!entityId) return
    const response = await removeFromHistory(entityId);
    if (!response) return;
    const newHistory = { ...history };
    Object.entries(newHistory).forEach(([date, videos]) => {
      newHistory[date] = videos.filter((video) => video.entityId !== entityId);
    });
    setHistory(newHistory);
  }

  return (
    <div className="relative max-w-6xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-end gap-4"
      >
        <HistoryIcon size={40} />
        <h1 className="text-5xl font-bold">Watch History</h1>
      </motion.div>

      <hr className="border-t border-red-700 my-6" />

      <div className="space-y-12">
        {Object.entries(history).map(([date, videos]: [string, VideoType[]]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-zinc-900 p-5 rounded-2xl shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-200 mb-4 border-b border-zinc-700 pb-2">
              {formatDate(date)}
            </h2>
            <VideoList videos={videos} listname="History" deleteFromList={deleteFromHistory} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
