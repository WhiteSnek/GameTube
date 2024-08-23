import React from "react";
import { VideoCardTemplate } from "../../templates/video_templates";
import formatDate from "../../utils/formatDate";
import formatViews from "../../utils/formatViews";
import truncateText from "../../utils/truncate_text";
import { Link } from "react-router-dom";
import HoverThumbnail from "../utilities/HoverThumbnail";

const VideoCard: React.FC<VideoCardTemplate> = ({
  videoId,
  title,
  userDetails,
  views,
  uploadTime,
  thumbnail,
  video,
  duration,
}) => {
  return (
    <Link to={`/videos/${videoId}`} className="text-white" key={videoId}>
      <HoverThumbnail duration={duration} video={video} thumbnail={thumbnail} />
      <div className='flex gap-4 mt-4'>
        <img src={userDetails.avatar} alt='avatar' className='h-8 w-8 rounded-full object-cover' />
        <div>
          <h1 className='font-bold text-lg'>{truncateText(title, 50)}</h1>
          <p className='text-gray-100 font-medium'>{userDetails.name}</p>
          <div className='flex gap-3 font-medium text-gray-300'>
            <p>{formatViews(views)} views</p>
            <p>{formatDate(uploadTime)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
