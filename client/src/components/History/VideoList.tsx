import React from 'react';
import { VideoCardTemplate } from '../../templates/video_templates';
import SearchListCard from '../utilities/SearchListCard';

interface VideoListProps {
  videos: VideoCardTemplate[];
}

const VideoList: React.FC<VideoListProps> = ({ videos }) => {
    console.log(videos)
  return (
    <div>
      {videos.map((video) => (
        <SearchListCard video={video} />
      ))}
    </div>
  );
};

export default VideoList;
