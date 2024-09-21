import React, { useEffect } from 'react'
import { useUser } from '../providers/UserProvider';
import { useVideo } from '../providers/VideoProvider';
import VideoList from '../components/SpecificPlaylist/VideoList';

const LikedVideos:React.FC = () => {
  const {user} = useUser();
  if(!user) return <div>Something went wrong!!</div>
  const {getLikedVideos} = useVideo();
  useEffect(()=>{
    const getVideos = async() => {
      const likedVideos: boolean = await getLikedVideos(user.id);
      if(likedVideos) {
        console.log('Videos fetched successfully')
      } else {
        console.log('Something went wrong!!')
      }
    }
    getVideos()
  },[])
  return (
    <div className='p-6'>
      <h1 className='text-white text-5xl font-bold mb-10'>Liked Videos</h1>
      <VideoList component='search' />
    </div>
  )
}

export default LikedVideos
