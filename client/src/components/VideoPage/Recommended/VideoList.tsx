import React from 'react';
import VideoListCard from '../../utilities/VideoListCard';
import SearchListCard from '../../utilities/SearchListCard';
import { useVideo } from '../../../providers/VideoProvider';

interface VideoListProps {
  component: string;
}

const VideoList: React.FC<VideoListProps> = ({ component }) => {
  const { video } = useVideo()

  if(!video) return (
    <div className='border-2 text-center bg-zinc-800 border-gray-400 flex justify-center items-center rounded-lg py-10 text-white text-3xl font-bold m-10'>No videos available.<br/> Try searching something else...</div>
  )
  return (
    <div>
      <ol>
        {video.map((vid, index) => (
          <li key={index}>
            {component === 'video' ? (
              <VideoListCard video={vid} />
            ) : <SearchListCard video={vid} />}

          </li>
        ))}
      </ol>
    </div>
  );
};

export default VideoList;