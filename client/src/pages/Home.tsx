import React from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';

const Home: React.FC = () => {
  return (
    <div className="relative">
        <TagList />
        <VideoGrid />
    </div>
  );
}

export default Home;
