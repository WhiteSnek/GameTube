import React from 'react'
import VideoDetails from '../components/VideoPage/Video/VideoDetails'
import Recommended from '../components/VideoPage/Recommended/Recommended'
import Comments from '../components/VideoPage/Comments/Comments'

const VideoPage:React.FC = () => {
  return (
    <div className='grid grid-cols-12'>
        <div className='col-span-8'>
            <VideoDetails />
            <Comments />
        </div>
        <div className='col-span-4'>
            <Recommended />
        </div>
    </div>
  )
}

export default VideoPage
