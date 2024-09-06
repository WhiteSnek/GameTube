import React from "react";
import formatViews from "../../utils/formatViews";
import truncateText from "../../utils/truncate_text";
import { Link } from "react-router-dom";
import HoverThumbnail from "../utilities/HoverThumbnail";
import { UserCard } from "../../templates/user_template";
import { GuildCard } from "../../templates/guild_template";
interface VideoCardProps {
  id: string;
    title: string;
    video: string;
    thumbnail: string;
    owner: UserCard;
    guild: GuildCard;
    views: number;
    // created_at: Date;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  owner,
  views,
  // created_at,
  thumbnail,
  video,
  guild
}) => {
  return (
    <Link to={`/videos/${id}`} className="text-white" key={id}>
      <HoverThumbnail duration={2000} video={video} thumbnail={thumbnail} />
      <div className='flex gap-4 mt-4'>
        <img src={owner.avatar} alt='avatar' className='h-8 w-8 rounded-full object-cover' />
        <div>
          <h1 className='font-bold text-lg'>{truncateText(title, 50)}</h1>
          <p className='text-gray-100 font-medium'>{owner.name}</p>
          <p className='text-white px-2 py-1 font-sm bg-red-400 text-xs font-bold my-2 rounded-md'>{guild.name}</p>
          <div className='flex gap-3 font-medium text-gray-300'>
            <p>{formatViews(views)} views</p>
            {/* <p>{formatDate(created_at)}</p> */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
