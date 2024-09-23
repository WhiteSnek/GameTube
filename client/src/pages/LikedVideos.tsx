import React, { useEffect, useState } from 'react'
import { useUser } from '../providers/UserProvider';
import { useVideo } from '../providers/VideoProvider';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/History/LoadingState';
import VideoList from '../components/History/VideoList';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import LoadingVideo from '../components/Guild/LoadingVideo';

const LikedVideos:React.FC = () => {
  const {user} = useUser();
  const [loading, setLoading] = useState<boolean>(false)
  const {getLikedVideos, video} = useVideo();
  const navigate = useNavigate()
  useEffect(()=>{
    if(!user){
      navigate('/login')
    } else {
    const getVideos = async() => {
      setLoading(true)
      const likedVideos: boolean = await getLikedVideos(user.id);
      if(likedVideos) {
        console.log('Videos fetched successfully')
      } else {
        console.log('Something went wrong!!')
      }
      setLoading(false)
    }
    getVideos()
  }
  },[])
  return (
    <div className='px-6 sm:p-6'>
      <h1 className='text-white text-3xl sm:text-5xl font-bold mb-2 sm:mb-10'>Liked Videos</h1>
      {loading? window.innerWidth > 768 ?<LoadingState /> : <LoadingVideo /> : window.innerWidth > 768 ? <VideoList videos={video} /> : <VideoGrid videos={video} />}
    </div>
  )
}

export default LikedVideos
