import { useGuild } from "@/context/guild_provider";
import { useUser } from "@/context/user_provider";
import { GuildDetailsType } from "@/types/guild.types";
import truncateText from "@/utils/truncate_text";
import { Crown, DoorOpen } from "lucide-react";
import React, { useEffect, useState } from "react";

interface DetailsProps {
  guild: GuildDetailsType;
}

const Details: React.FC<DetailsProps> = ({ guild }) => {
  const { getGuildImages, images, Guild, joinGuild, leaveGuild } = useGuild();
  const [joined, setJoined] = useState<boolean>(guild.joined)
  const { User } = useUser();
  const toggleMembership = async () => {
    let response;
    if(joined){
      response = await leaveGuild(guild.id)
      setJoined(false)
    } else {
      response = await joinGuild(guild.id)
      setJoined(true)
    }
    console.log(response) 
  }
  useEffect(() => {
    getGuildImages(guild.id);
  }, [Guild]);
  return (
    <div className="w-full bg-white dark:bg-zinc-800 shadow-lg rounded-2xl overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gray-300 flex items-center justify-center">
        <img
          src={images?.coverUrl || "/default-cover.png"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar & Channel Info */}
      <div className="p-6 flex items-center space-x-4">
        <img
          src={images?.avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          className="w-20 h-20 object-cover aspect-square rounded-full border-4 border-zinc-950 dark:border-white shadow-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">{guild.name}</h2>

          {guild.description && (
            <p className="text-zinc-700 dark:text-zinc-300">
              {truncateText(guild.description, 200)}
            </p>
          )}
        </div>
      </div>

      {/* Manage Button */}
      <div className="p-6 flex justify-end">
          {guild.ownerId === User?.id ? (
            <button className="px-4 bg-red-500 cursor-pointer text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2">
              <Crown className="w-5 h-5" /> Manage Guild
            </button>
          ) : (
            <button onClick={toggleMembership} className="px-4 bg-red-500 cursor-pointer text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />{joined ? "Leave Guild" : "Join Guild"}
            </button>
          )}
      </div>
    </div>
  );
};

export default Details;
