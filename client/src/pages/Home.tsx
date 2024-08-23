import React from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';
import { dummyVideos } from '../components/constants';

const Home: React.FC = () => {
  return (
    <div className='mt-[8rem]'>
        <TagList />
        <VideoGrid videos={dummyVideos} />
    </div>
  );
}

export default Home;
