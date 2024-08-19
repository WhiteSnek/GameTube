import React, { useEffect, useState } from 'react'
import { PlayListsTemplate } from '../../templates/playlist_template';
import { dummyPlaylists } from '../constants';
import { useSidebar } from '../../providers/SidebarProvider';
import PlaylistCard from './PlaylistCard';

const PlaylistGrid:React.FC = () => {
    const [playlists,setPlaylists] = useState<PlayListsTemplate[]>([]);
    const {showSidebar} = useSidebar()
    useEffect(()=>{
        setPlaylists(dummyPlaylists)
    },[])
  return (
    <div className={`grid grid-cols-1 gap-4 p-6 ${showSidebar ? 'sm:grid-cols-4' : 'sm:grid-cols-5'}  pt-6 transition-all`}>
      {playlists.map((playlist)=>(
        <PlaylistCard playlist={playlist} />
      ))}
    </div>
  )
}

export default PlaylistGrid;