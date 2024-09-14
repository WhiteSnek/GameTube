import React, { useEffect, useState, useCallback } from 'react';
import { VideoCardTemplate } from '../../../templates/video_templates';
import { Link } from 'react-router-dom';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import formatViews from '../../../utils/formatViews';
import { useUser } from '../../../providers/UserProvider';
import { Snackbar, Alert } from '@mui/material';

interface DetailsProps {
  video: VideoCardTemplate;
}

const Details: React.FC<DetailsProps> = ({ video }) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isAMember, setIsAMember] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { joinGuild, leaveGuild, checkMembership, user } = useUser();

  const toggleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const toggleSaved = useCallback(() => {
    setSaved((prev) => !prev);
  }, []);

  useEffect(() => {
    console.log(video)
    const check = async () => {
      if (video) {
        const guildId = video.guild?.id || '';
        const response = await checkMembership(guildId);
        setIsAMember(response);
      }
    };
    check();
  }, [video, checkMembership]);

  const toggleSubscription = async () => {
    const guildId = video?.guild?.id || '';
    if (!user) {
      setSnackbarMessage('Login to join guild!!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    let success: string;
    if (isAMember) {
      success = await leaveGuild(guildId);
    } else {
      success = await joinGuild(guildId);
    }
    setSnackbarMessage(success);
    // Update snackbar based on the action success
    if (success.includes('successfully')) {
      setSnackbarSeverity('success');
    } else {
      setSnackbarSeverity('error');
    }

    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!video) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className='text-3xl text-white font-bold py-5'>{video.title}</h1>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Link to={`/guild/${video.owner?.userId}`} className='flex items-center gap-3'>
            <img src={video.owner?.avatar} alt={video.owner?.username} className='h-8 rounded-full aspect-square object-cover'/>
            <div>
              <h3 className='text-white font-semibold text-lg'>{video.owner?.username}</h3>
              <p className='text-sm text-gray-300 bg-red-500 text-center rounded-md'>{video.guild.name}</p>
            </div>
          </Link>
          <button onClick={toggleSubscription} className='bg-red-500 px-4 py-2 text-md rounded-lg font-bold text-white shadow-xl btn-5'>
            {isAMember ? 'Leave Guild' : 'Join Guild'}
          </button>
        </div>
        <div className='flex gap-4 items-center'>
          <button onClick={toggleLike} className='text-white py-2 px-4 bg-red-500 rounded-full'>
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </button>
          <button className='text-white py-2 px-4 bg-red-500 rounded-full'>
            <ShareOutlinedIcon /> Share
          </button>
          <button className='text-white py-2 px-4 bg-red-500 rounded-full'>
            <DownloadOutlinedIcon /> Download
          </button>
          <button onClick={toggleSaved} title='save' className='text-white py-2 px-4 bg-red-500 rounded-full'>
            {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </button>
        </div>
      </div>
      <div className='p-4 m-4 bg-zinc-800 rounded-lg'>
        <div className='flex text-white gap-3 text-sm font-bold'>
          <p>{formatViews(video.views)} views</p>
        </div>
        <p className='text-white'>Description</p>
      </div>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Details;
