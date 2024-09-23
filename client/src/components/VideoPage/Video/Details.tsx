import React, { useEffect, useState, useCallback } from 'react';
import { VideoDetailsTemplate } from '../../../templates/video_templates';
import { Link } from 'react-router-dom';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import formatViews from '../../../utils/formatViews';
import { useUser } from '../../../providers/UserProvider';
import { Snackbar, Alert } from '@mui/material';
import { useVideo } from '../../../providers/VideoProvider';
import truncateText from '../../../utils/truncate_text';

interface DetailsProps {
  video: VideoDetailsTemplate;
}

const Details: React.FC<DetailsProps> = ({ video }) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [isAMember, setIsAMember] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [likeCount, setLikeCount] = useState<number>(video.likes);
  const { joinGuild, leaveGuild, checkMembership, user } = useUser();
  const { likeVideo, unlikeVideo, videoLiked } = useVideo();

  useEffect(() => {
    const details = { userId: user?.id, entityId: video.id, entityType: 'video' };
    const checkLike = async () => {
      const response = await videoLiked(details);
      setLiked(response);
    };
    checkLike();
  }, []);

  const toggleLike = useCallback(async () => {
    if (liked) {
      await removeLike();
    } else {
      await addLike();
    }
  }, [liked, video.id, user?.id, likeVideo, unlikeVideo]);

  const removeLike = async () => {
    if (!user?.id) return;
    const details = { userId: user.id, entityId: video.id, entityType: 'video' };
    const success = await unlikeVideo(details);
    if (success) {
      setLikeCount(likeCount - 1);
      setLiked(false);
    } else {
      console.error('Failed to remove like.');
    }
  };

  const addLike = async () => {
    if (!user?.id) return;
    const details = { userId: user.id, entityId: video.id, entityType: 'video' };
    const success = await likeVideo(details);
    if (success) {
      setLikeCount(likeCount + 1);
      setLiked(true);
    } else {
      console.error('Failed to add like.');
    }
  };

  useEffect(() => {
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
      setSnackbarMessage('Login to join guild!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const success = isAMember ? await leaveGuild(guildId) : await joinGuild(guildId);
    setIsAMember(!isAMember)
    setSnackbarMessage(success);
    setSnackbarSeverity(success.includes('successfully') ? 'success' : 'error');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const shareVideo = () => {
    const videoUrl = `${window.location.origin}/videos/${video.id}`;

    navigator.clipboard.writeText(videoUrl)
      .then(() => {
        setSnackbarMessage('Video URL copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(err => {
        setSnackbarMessage('Failed to copy the URL');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error('Failed to copy the URL: ', err);
      });
  };

  if (!video) {
    return <div>Loading...</div>;
  }

  return (
    <div className='sm:p-4'>
      <h1 className='text-xl sm:text-3xl text-white font-semibold sm:font-bold py-2 sm:py-5'>
        {video.title}
      </h1>
      <div className='flex items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className='h-8 sm:h-12 rounded-full aspect-square object-cover'
            />
            <div className='flex flex-col'>
              <Link
                to={`/profile/${video.owner.id}`}
                className='text-white font-semibold text-sm sm:text-lg'
              >
                {video.owner?.username}
              </Link>
              <Link
                to={`/guilds/${video.guild.id}`}
                className='text-xs sm:text-sm text-gray-300 bg-red-500 text-center rounded-md'
              >
                {truncateText(video.guild.name, 15)}
              </Link>
            </div>
          </div>
        <div className='grid grid-cols-3 gap-2 sm:gap-4 items-center'>
          <button
              onClick={toggleSubscription}
              className='bg-red-500 sm:text-lg px-2 sm:px-4 py-2 text-xs sm:text-md rounded-lg font-bold text-white shadow-xl flex justify-center items-center'
            >
              {isAMember ? 'Leave' : 'Join'} {window.innerWidth > 768 && 'Guild'}
            </button>
          <button
            onClick={toggleLike}
            className='text-white sm:text-lg text-xs py-1 sm:py-2 px-3 sm:px-4 bg-red-500 rounded-full flex gap-1 sm:gap-2 justify-center items-center'
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />} {window.innerWidth > 768  && likeCount}
          </button>
          <button
            onClick={shareVideo}
            className='text-white sm:text-lg text-xs py-1 sm:py-2 px-3 sm:px-4 bg-red-500 rounded-full flex gap-2 justify-center items-center'
            aria-label='Share'
          >
            <ShareOutlinedIcon /> {window.innerWidth > 768 ? "Share" : ""}
          </button>
        </div>
      </div>
      <div className='p-3 sm:p-4 m-2 sm:m-4 bg-zinc-800 rounded-lg'>
        <div className='flex text-white gap-3 text-sm font-bold'>
          <p>{formatViews(video.views)} views</p>
        </div>
        <p className='text-gray-300 text-xs sm:text-sm'>{video.description}</p>
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
