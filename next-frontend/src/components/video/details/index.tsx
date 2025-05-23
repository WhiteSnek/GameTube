"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Bookmark, DoorOpen } from "lucide-react";
import { VideoDetailstype } from "@/types/video.types";
import formatDate from "@/utils/formatDate";
import { useUser } from "@/context/user_provider";
import formatViews from "@/utils/formatViews";
import { useVideo } from "@/context/video_provider";
import { useGuild } from "@/context/guild_provider";
import { GuildMembersType } from "@/types/guild.types";
interface VideoDetailsProps {
  video: VideoDetailstype;
}
const VideoDetails: React.FC<VideoDetailsProps> = ({ video }) => {
  const [likes, setLikes] = useState<number>(video.likes);
  const [liked, setLiked] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const [members, setMembers] = useState<number>(0);
  const { User } = useUser()
  const { getGuildMembers, joinGuild, leaveGuild } = useGuild();
  const { addToWatchLater, removeFromWatchLater, checkVideoInWatchLater } = useVideo();
  const toggleMembership = async () => {
    let response;
    if (joined) {
      response = await leaveGuild(video.guildId);
      setJoined(false);
    } else {
      response = await joinGuild(video.guildId);
      setJoined(true);
    }
    console.log(response);
  };
  useEffect(()=>{
    const fetchDetails = async () => {
      const response: GuildMembersType[] = await getGuildMembers(video.guildId);
      if(response) {
        setMembers(response.length);
        const isSubscribed = response.some((member) => member.userId === User?.id);
        setJoined(isSubscribed)
      }
    }
    fetchDetails()
  },[])
  useEffect(() => {
    const handleCheckSaved = async () => {
      const response = await checkVideoInWatchLater(video.id);
      setSaved(response);
    };
    handleCheckSaved();
  }, []);
  const { addLike, removeLike, getLike } = useUser();
  useEffect(() => {
    const handleIsLiked = async () => {
      const response = await getLike(video.id, "video");
      setLiked(response);
    };
    handleIsLiked();
  }, []);
  const handleToggleLike = async () => {
    let response;
    if (liked) {
      response = await removeLike(video.id, "video");
      setLiked(false);
      setLikes((likes) => likes - 1);
    } else {
      response = await addLike(video.id, "video");
      setLiked(true);
      setLikes((likes) => likes + 1);
    }
  };
  const handleToggleSave = async () => {
    let response;
    if (saved) {
      response = await removeFromWatchLater(video.id);
      setSaved(false);
    } else {
      response = await addToWatchLater(video.id);
      setSaved(true);
    }
  };
  return (
    <div className="p-6 mt-4 w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg">
      {/* Video Title */}
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        {video.title}
      </h1>

      {/* Channel Info */}
      <div className="flex items-center justify-between gap-4 mt-3">
        <div className="flex items-center gap-4">
        <img
          src={video.guildAvatar}
          alt="Channel Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            {video.guildName} ·{" "}
            <span className="text-zinc-500 font-normal">
              posted by {video.ownerName}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {members} members
          </p>
        </div>
        </div>
        <div className="flex flex-col gap-2">
            <button
              onClick={toggleMembership}
              className="ml-auto w-full flex justify-center items-center gap-4 bg-red-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-red-700"
            >
              <DoorOpen size={16} />{joined ? "Leave Guild" : "Join Guild"}
            </button>
          
        </div>
      </div>

      {/* Video Details */}
      <div className="mt-4">
        <p className="text-gray-600 dark:text-gray-300">
          {formatViews(video.views)} views • {formatDate(video.uploadDate)}
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {video.description}
        </p>
        {/* Tags */}
        <div className="mt-2 flex gap-2">
          {video.tags && video.tags.length > 0 && video.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-red-500 px-2 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <Button
          onClick={handleToggleLike}
          className="bg-red-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-red-700"
        >
          {liked ? <ThumbsUp size={18} fill="white" /> : <ThumbsUp size={18} />}
          {likes} likes
        </Button>
        <Button
            onClick={handleToggleSave}
            className=" bg-red-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-red-700"
          >
            {saved ? (
              <>
                <Bookmark size={16} fill="white" /> Remove from Watch Later
              </>
            ) : (
              <>
                <Bookmark size={16} />
                Add to Watch Later
              </>
            )}
          </Button>
      </div>
    </div>
  );
};

export default VideoDetails;
