import React from 'react'
import PlaylistGrid from '../components/PlaylistGrid/PlaylistGrid'

const Playlists:React.FC = () => {
  return (
    <div>
      <h1 className='text-white font-bold text-4xl p-8'>Playlists</h1>
      <PlaylistGrid />
    </div>
  )
}

export default Playlists
