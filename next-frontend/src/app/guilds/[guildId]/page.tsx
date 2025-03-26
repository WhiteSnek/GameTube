"use client";
import CreateGuild from "@/components/create_guild";
import Chat from "@/components/guilds/chat";
import Details from "@/components/guilds/details";
import UploadVideo from "@/components/upload_video";
import { VideoCards } from "@/components/video_cards";
import { useGuild } from "@/context/guild_provider";
import { Radio, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Guild() {
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const { Guild, getGuild } = useGuild();
  const params = useParams();
  const guildId = Array.isArray(params.guildId)
    ? params.guildId[0]
    : params.guildId;
  useEffect(() => {
    if (!guildId) return;

    if (guildId !== "1") {
      getGuild(guildId);
    } else {
      getGuild();
    }
  }, [guildId]);
  if (Guild)
    return (
      <div className="relative flex justify-between gap-4 px-6 py-2">
        <div className="flex-1 max-w-4xl">
          <Details guild={Guild} />

          {/* Guild Videos Header with Upload Button */}
          <div className="flex items-center justify-between p-4">
            <h1 className="text-3xl font-bold">Guild Videos</h1>
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bg-red-500 flex justify-center items-center gap-2  hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer transition"
              >
                <Upload /> Upload
              </button>
              <UploadVideo
                open={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                guildName="Tojo Clan"
              />
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
  return <CreateGuild />;
}
