import React from 'react'
import { useSidebar } from '../providers/SidebarProvider'
import PlaylistGrid from '../components/PlaylistGrid/PlaylistGrid'

const Playlists:React.FC = () => {
    const {showSidebar} = useSidebar()
  return (
    <div className={`${showSidebar ?'ml-[16.67%]' : ''} mt-[5rem]`}>
      <h1 className='text-white font-bold text-4xl p-8'>Playlists</h1>
      <PlaylistGrid />
    </div>
  )
}

export default Playlists
