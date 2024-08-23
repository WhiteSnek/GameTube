import React from 'react'
import VideoGrid from '../components/VideoGrid/VideoGrid'
import { dummyVideos } from '../components/constants'
import SubscriptionChannels from '../components/SubscriptionGuilds/SubscriptionGuilds'

const Subscriptions: React.FC = () => {
  return (
    <div>
        <SubscriptionChannels userDetails={dummyVideos.map((video)=>video.userDetails)} />
        <h1 className='px-6 py-4 text-white text-3xl font-bold'>Latest</h1>
      <VideoGrid videos={dummyVideos} />
    </div>
  )
}

export default Subscriptions
