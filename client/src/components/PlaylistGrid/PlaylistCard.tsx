import React from 'react';
import { PlayListsTemplate } from '../../templates/playlist_template';
import { Link } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface PlaylistProps {
    playlist: PlayListsTemplate;
}

const PlaylistCard: React.FC<PlaylistProps> = ({ playlist }) => {
    return (
        <div className='relative group'>
            <div className='relative'>
                <img 
                    src={playlist.thumbnail} 
                    alt={playlist.name} 
                    className='rounded-md w-full h-auto object-cover'
                />
                <div className='absolute top-0 left-0 w-full h-full bg-black rounded-md opacity-0 group-hover:opacity-60 transition-opacity duration-300'></div>
                <Link to={`/videos/${playlist.id}`} className='absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <PlayArrowIcon /> Play All
                </Link>
            </div>
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
