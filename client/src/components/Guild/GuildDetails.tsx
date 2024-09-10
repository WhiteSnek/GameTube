import React, { useEffect } from "react";
import { useGuild } from "../../providers/GuildProvider";
import { useUser } from "../../providers/UserProvider";
import { useVideo } from "../../providers/VideoProvider";
import VideoGrid from "../VideoGrid/VideoGrid";

interface GuildDetailsProps {
  guildId: string;
}

const GuildDetails: React.FC<GuildDetailsProps> = ({ guildId }) => {
  const { getGuildInfo, guild } = useGuild();
  const { user } = useUser();
  const { video, getGuildVideos } = useVideo();
  useEffect(() => {
    const getGuild = async () => {
      const success: boolean = await getGuildInfo(guildId);
      if (success) {
        console.log(guild);
      } else {
        console.log("Failed to get guild info");
      }
    };
    const fetchGuildVideos = async () => {
      const success: boolean = await getGuildVideos(guildId);
      if (success) {
        console.log(video);
      } else {
        console.log("Failed to get guild videos");
      }
    };
    getGuild();
    fetchGuildVideos();
  }, [guildId, getGuildInfo]);

  if (!guild) return <p>Loading guild details...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className=" bg-zinc-800 text-white rounded-lg shadow-lg p-4">
        <div className="relative">
          <img
            src={guild.cover_image}
            alt={`${guild.guild_name} Cover`}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <img
            src={guild.avatar}
            alt={`${guild.guild_name} Avatar`}
            className="w-24 h-24 rounded-full border-4 border-zinc-800 absolute bottom-0 left-4 transform translate-y-1/2"
          />
        </div>
        <div className="flex justify-around items-center">
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold">{guild.guild_name}</h2>
            <p className="mt-2 text-gray-200">{guild.guild_description}</p>
          </div>
          {user?.guild === guildId ? (
            <button className="bg-red-500 px-4 py-2 text-lg rounded-lg font-bold text-white shadow-xl btn-5">
              Manage
            </button>
          ) : (
            <button className="bg-red-500 px-4 py-2 text-lg rounded-lg font-bold text-white shadow-xl btn-5">
              Join Guild
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h1 className="p-2 border-b-2 border-red-500 w-full text-white text-3xl font-bold">Guild Videos</h1>
      <VideoGrid videos={video} />
      </div>
    </div>
  );
};

export default GuildDetails;
