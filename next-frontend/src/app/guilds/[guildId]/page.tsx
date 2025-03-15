'use client'
import Chat from "@/components/guilds/chat";
import Details from "@/components/guilds/details";
import UploadVideo from "@/components/upload_video";
import { VideoCards } from "@/components/video_cards";
import { Radio, Upload } from "lucide-react";
import { useState } from "react";

export default function Guild() {
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  return (
    <div className="relative flex justify-between gap-4 px-6 py-2">
      <div className="flex-1 max-w-4xl">
        <Details />

        {/* Guild Videos Header with Upload Button */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-3xl font-bold">Guild Videos</h1>
          <div className="flex justify-center items-center gap-3">
          <button onClick={() => setIsUploadOpen(true)} className="bg-red-500 flex justify-center items-center gap-2  hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer transition">
            <Upload /> Upload
          </button>
          <UploadVideo open={isUploadOpen} onClose={() => setIsUploadOpen(false)} guildName="Tojo Clan" />
          <button className="bg-red-500 flex justify-center items-center gap-2  hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer transition">
            <Radio /> Go Live
          </button>
          </div>
        </div>

        <hr className="border-t border-red-700 mx-4" />
        <VideoCards />
      </div>

      <Chat />
    </div>
  );
}
