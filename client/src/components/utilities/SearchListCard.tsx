import React from 'react';
import { VideoCardTemplate } from '../../templates/video_templates';
import { Link } from 'react-router-dom';
import formatDate from '../../utils/formatDate';
import formatViews from '../../utils/formatViews';
import HoverThumbnail from './HoverThumbnail';

interface SearchListProps {
  video: VideoCardTemplate;
}

const SearchListCard: React.FC<SearchListProps> = ({ video }) => {
  return (
    <Link to={`/videos/${video.id}`} className="flex items-center justify-between p-4 hover:bg-zinc-800 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="h-60 aspect-video flex-shrink-0">
          <HoverThumbnail video={video.video} thumbnail={video.thumbnail} duration={video.duration} />
        </div>
        <div className="flex flex-col justify-between">
          <h1 className="text-white text-2xl font-bold">{video.title}</h1>
          <p className="text-md text-zinc-400 font-semibold">{video.owner.username}</p>
          <div className="flex gap-2 text-gray-300 text-sm">
            <p>{formatViews(video.views)} views</p>
            <p>{formatDate(video.created_at)}</p>
          </div>
          <p className='text-md py-6 text-zinc-400 font-thin'>{video.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default SearchListCard;
