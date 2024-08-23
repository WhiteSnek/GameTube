import React, { useEffect, useState } from "react";
import { OnePlaylist } from "../templates/playlist_template";
import { playlistDummyData } from "../components/constants";
import PlaylistDetails from "../components/SpecificPlaylist/PlaylistDetails";
import { useSidebar } from "../providers/SidebarProvider";
import VideoList from "../components/SpecificPlaylist/VideoList";

const SpecificPlaylist: React.FC = () => {
  const [playlist, setPlaylist] = useState<OnePlaylist | null>(null);
  useEffect(() => {
    setPlaylist(playlistDummyData);
  }, []);
  const { showSidebar } = useSidebar();
  if (!playlist) return <div>Playlist not found!!</div>;
  return (
    <div
      className= 'grid grid-cols-12 gap-6 px-10'
    >
      <div className={`${showSidebar ? 'col-span-4': 'col-span-3'}`}>
        <PlaylistDetails
          id={playlist.id}
          name={playlist.name}
          description={playlist.description}
          thumbnail={playlist.thumbnail}
          views={playlist.views}
          length={playlist.length}
          createdAt={playlist.createdAt}
          owner={playlist.owner}
          videoId={playlist.videos[0].videoId}
        />
      </div>
      <div className={`${showSidebar ? 'col-span-8': 'col-span-9'}`}>
        <VideoList videos={playlist.videos} component="playlist" />
      </div>
    </div>
  );
};

export default SpecificPlaylist;
