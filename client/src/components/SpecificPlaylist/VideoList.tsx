import React from 'react';
import { VideoCardTemplate } from '../../templates/video_templates';
import VideoListPlaylistCard from '../utilities/VideoListPlaylistCard';
import VideoListCard from '../utilities/VideoListCard';
import SearchListCard from '../utilities/SearchListCard';

interface VideoListProps {
  videos: VideoCardTemplate[];
  component: string;
}

const VideoList: React.FC<VideoListProps> = ({ videos, component }) => {
  return (
    <div>
      <ol>
        {videos.map((video, index) => (
          <li key={index}>
            {component === 'playlist' ? (
              <VideoListPlaylistCard video={video} index={index + 1} />
            ) : component === 'video' ? (
              <VideoListCard video={video} />
            ) : <SearchListCard video={video} />}

          </li>
        ))}
      </ol>
    </div>
  );
};

export default VideoList;
