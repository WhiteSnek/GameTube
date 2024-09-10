import React, { useEffect } from 'react'
import VideoList from '../../SpecificPlaylist/VideoList'
import { useVideo } from '../../../providers/VideoProvider'

const Recommended:React.FC = () => {
  const {video, getAllVideos} = useVideo();
  useEffect(()=>{
    const getVideos = async () => {
    const success: boolean = await getAllVideos();
    if(success){
      console.log(video)
      console.log('Videos retrieved')
    } else {
      console.log('Error retreiving videos')
    }
  }
  getVideos()
  },[])
  return (
    <div className='mx-4'>
      <h1 className='text-xl font-bold text-white px-4 pt-4'>Recommended</h1>
      <VideoList component='video' />
    </div>
  )
}

export default Recommended
