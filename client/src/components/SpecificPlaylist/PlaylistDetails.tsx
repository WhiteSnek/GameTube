import React from 'react';
import ThumbnailOverlay from '../utilities/ThumbnailOverlay';
import formatDate from '../../utils/formatDate';
import ButtonGroup from '../utilities/ButtonGroup';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import formatViews from '../../utils/formatViews';

interface PlaylistDetailProps {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    length: number;
    owner: string;
    views: number;
    createdAt: Date;
    videoId: string;
}

const PlaylistDetails: React.FC<PlaylistDetailProps> = ({ id, name, description, thumbnail, length, owner, views, createdAt, videoId }) => {
  return (
    <div className='w-full group p-4 rounded-md bg-gradient-to-b from-fuchsia-800 to-zinc-900 sticky top-[5rem]'>
      <ThumbnailOverlay name={name} thumbnail={thumbnail} id={id} videoId={videoId} />
      <h1 className='text-white text-3xl font-bold py-5'>{name}</h1>
      <p className='text-white text-lg '>{owner}</p>
      <div className='flex gap-2 text-gray-400 text-sm'>
        <p>{length} videos</p>
        <p>{formatViews(views)} views</p>
        <p>Updated {formatDate(createdAt)}</p>
      </div>
      <ButtonGroup />
      <div className='grid grid-cols-2 gap-2'>
        <button className='font-bold bg-white py-2 rounded-3xl flex justify-center items-center gap-2'>
          <PlayArrowIcon />Play All
        </button>
        <button className='text-white font-bold bg-gray-500/80 py-2 rounded-3xl flex justify-center items-center gap-2'>
          <ShuffleIcon />Shuffle
        </button>
      </div>
      <p className='text-white py-4 text-sm font-thin '>{description}</p>
    </div>
  );
};

export default PlaylistDetails;
