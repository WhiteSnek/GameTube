import React from 'react';
import { VideoCardTemplate } from '../../templates/video_templates';
import { Link } from 'react-router-dom';
import formatDate from '../../utils/formatDate';
import formatViews from '../../utils/formatViews';
import HoverThumbnail from './HoverThumbnail';

interface VideoListProps {
  video: VideoCardTemplate;
}

const VideoListCard: React.FC<VideoListProps> = ({ video }) => {
  return (
    <Link to={`/videos/${video.id}`} className="flex items-center justify-between p-4 hover:bg-zinc-800 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="w-40 h-24 flex-shrink-0">
          <HoverThumbnail video={video.video} thumbnail={video.thumbnail} duration={video.duration} />
        </div>
        <div className="flex flex-col justify-between">
          <h1 className="text-white text-sm sm:text-lg sm:font-bold">{video.title}</h1>
          <p className="text-xs sm:text-md text-zinc-400 font-thin sm:font-semibold">{video.owner.username}</p>
          <div className="flex gap-2 text-gray-300 text-sm">
            <p className='sm:text-md text-xs'>{formatViews(video.views)} views</p>
            <p className='sm:text-md text-xs'>{formatDate(video.created_at)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoListCard;
