import React from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';
import { dummyVideos } from '../components/constants';
import { useSidebar } from '../providers/SidebarProvider';

const Home: React.FC = () => {
  const {showSidebar} = useSidebar()
  return (
    <div className={`${showSidebar ?'ml-[16.67%]' : ''} mt-[7.5rem]`}>
        <TagList />
        <VideoGrid videos={dummyVideos} />
    </div>
  );
}

export default Home;
