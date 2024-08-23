import React from 'react';
import { PlayListsTemplate } from '../../templates/playlist_template';
import { Link } from 'react-router-dom';

import ThumbnailOverlay from '../utilities/ThumbnailOverlay';

interface PlaylistProps {
    playlist: PlayListsTemplate;
}

const PlaylistCard: React.FC<PlaylistProps> = ({ playlist }) => {
    // Assuming you have a videoId you want to pass; you can use the first video in the playlist, for example.
    const videoId = playlist.videoId || '';

    return (
        <div className='relative group'>
            <ThumbnailOverlay thumbnail={playlist.thumbnail} name={playlist.name} id={playlist.id} videoId={videoId} />
            <div className='mt-2'>
                <h2 className='text-lg text-white font-bold'>{playlist.name}</h2>
                <div className='flex gap-4 text-gray-300 text-sm'>
                    <p>{playlist.owner}</p> 
                    <p>Playlist</p>
                </div>
                <Link 
                    to={`/playlist/${playlist.id}`} 
                    className='text-gray-300 text-sm font-semibold hover:text-gray-200'
                >
                    View Playlist
                </Link>
            </div>
        </div>
    );
};

export default PlaylistCard;
