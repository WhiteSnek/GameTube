import React from 'react';
import VideoListPlaylistCard from '../utilities/VideoListPlaylistCard';
import VideoListCard from '../utilities/VideoListCard';
import SearchListCard from '../utilities/SearchListCard';
import { useVideo } from '../../providers/VideoProvider';

interface VideoListProps {
  component: string;
}

const VideoList: React.FC<VideoListProps> = ({ component }) => {
  const { video } = useVideo()
  console.log('Videos in VideoList:', video);
  return (
    <div>
      <ol>
        {video.map((vid, index) => (
          <li key={index}>
            {component === 'playlist' ? (
              <VideoListPlaylistCard video={vid} index={index + 1} />
            ) : component === 'video' ? (
              <VideoListCard video={vid} />
            ) : <SearchListCard video={vid} />}

          </li>
        ))}
      </ol>
    </div>
  );
};

export default VideoList;
