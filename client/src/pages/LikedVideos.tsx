import React, { useEffect, useState } from 'react'
import { useUser } from '../providers/UserProvider';
import { useVideo } from '../providers/VideoProvider';
import VideoList from '../components/VideoPage/Recommended/VideoList';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/History/LoadingState';

const LikedVideos:React.FC = () => {
  const {user} = useUser();
  const [loading, setLoading] = useState<boolean>(false)
  const {getLikedVideos} = useVideo();
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
    <div className='p-6'>
      <h1 className='text-white text-5xl font-bold mb-10'>Liked Videos</h1>
      {loading?<LoadingState /> :<VideoList component='search' />}
    </div>
  )
}

export default LikedVideos
