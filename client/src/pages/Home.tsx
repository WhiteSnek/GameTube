import React, { useEffect } from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';
import { useVideo } from '../providers/VideoProvider';

const Home: React.FC = () => {
  const {video, getAllVideos} = useVideo();
  useEffect(()=>{
    const getVideos = async () => {
    const success:boolean = await getAllVideos();
    if(success){
      console.log('Successfully fetched videos');
    } else {
      console.log('Error loading videos')
    }
  }
  getVideos();
  },[])
  return (
    <div className='mt-[8rem]'>
        <TagList />
        <VideoGrid videos={video} />
    </div>
  );
}

export default Home;
