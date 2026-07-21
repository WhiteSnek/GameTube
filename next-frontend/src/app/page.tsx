"use client";
import { useEffect, useState } from "react";
import { VideoCards } from "@/components/video_cards";
import { useVideo } from "@/context/video_provider";
import { VideoType } from "@/types/video.types";
import UploadVideo from "@/components/upload_video";
import { Upload } from "lucide-react";

export default function Home() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const { getVideos } = useVideo();

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await getVideos();
      setVideos(response);
    };
    fetchVideos();
  }, []);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="bg-red-500 flex justify-center items-center gap-2 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer transition"
      >
        <Upload /> Upload
      </button>
      <UploadVideo
        open={open}
        onClose={() => setOpen(false)}
        guildName="Tojo clan"
        guildId="12345"
      />
      <VideoCards videos={videos} showAvatar />
    </div>
  );
}
