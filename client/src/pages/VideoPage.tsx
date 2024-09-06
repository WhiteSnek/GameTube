import React, { useEffect } from 'react'
import VideoDetails from '../components/VideoPage/Video/VideoDetails'
import Recommended from '../components/VideoPage/Recommended/Recommended'
import Comments from '../components/VideoPage/Comments/Comments'
import { useParams } from 'react-router-dom'
import { useVideo } from '../providers/VideoProvider'

const VideoPage:React.FC = () => {
  const {id} = useParams()
  const {video, getVideoDetails} = useVideo();
  useEffect(()=>{
    const getVideo = async() => {
      const videoId = id? id : ""
      const success = await getVideoDetails(videoId);
      if(success){
        console.log('Video fetched successfully');
      } else {
        console.log('Error loading video')
      }
    }
    getVideo()
  },[])
  return (
    <div className='grid grid-cols-12'>
        <div className='col-span-8'>
            <VideoDetails video={video[0]}  />
            <Comments />
        </div>
        <div className='col-span-4'>
            <Recommended />
        </div>
    </div>
  )
}

export default VideoPage
