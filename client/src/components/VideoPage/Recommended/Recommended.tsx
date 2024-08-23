import React from 'react'
import VideoList from '../../SpecificPlaylist/VideoList'
import { dummyVideos } from '../../constants'

const Recommended:React.FC = () => {
  return (
    <div className='mx-4'>
      <h1 className='text-xl font-bold text-white px-4 pt-4'>Recommended</h1>
      <VideoList videos={dummyVideos} component='video' />
    </div>
  )
}

export default Recommended
