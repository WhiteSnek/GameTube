import React, { useEffect } from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';
import { useVideo } from '../providers/VideoProvider';
import { useUser } from '../providers/UserProvider';

const Home: React.FC = () => {
  const {user} = useUser();
  const {video, getUserVideos} = useVideo();
  useEffect(()=>{
    const getVideos = async () => {
    const userId: string = user ? user.id : "";
    const success:boolean = await getUserVideos(userId);
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
