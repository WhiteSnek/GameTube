import React from 'react'
import VideoList from '../components/SpecificPlaylist/VideoList'
import { dummyVideos } from '../components/constants'

const Search: React.FC = () => {
  return (
    <div>
      <VideoList videos={dummyVideos} component='search' />
    </div>
  )
}

export default Search
