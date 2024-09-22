import React, { useEffect, useState } from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import SubscriptionChannels from '../components/SubscriptionGuilds/SubscriptionGuilds';
import { useUser } from '../providers/UserProvider';
import { GetGuilds } from '../templates/guild_template';
import { VideoCardTemplate } from '../templates/video_templates';
import { useVideo } from '../providers/VideoProvider';
import LoadingState from '../components/VideoGrid/LoadingState'; // Import LoadingState component
import LoadingGuilds from '../components/SubscriptionGuilds/LoadingGuilds';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

// Helper for Snackbar Alert
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Subscriptions: React.FC = () => {
  const [guilds, setGuilds] = useState<GetGuilds[]>([]);
  const [videos, setVideos] = useState<VideoCardTemplate[]>([]);
  const [loadingGuilds, setLoadingGuilds] = useState<boolean>(true);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [guildsError, setGuildsError] = useState<string | null>(null); // Error state for guilds
  const [videosError, setVideosError] = useState<string | null>(null); // Error state for videos
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate()
  const { getUserGuilds, user } = useUser();
  const { getGuildVideos } = useVideo();

  useEffect(() => {
    if(!user){
      navigate('/login')
    }
    const fetchGuilds = async () => {
      setLoadingGuilds(true);
      setGuildsError(null); // Reset error before fetching
      try {
        const response = await getUserGuilds();
        if (!response) {
          throw new Error('Failed to load guilds');
        }
        setGuilds(response);
      } catch (error) {
        setGuildsError((error as Error).message);
        setOpenSnackbar(true); // Open snackbar for guild error
      } finally {
        setLoadingGuilds(false);
      }
    };
    fetchGuilds();
  }, [getUserGuilds]);

  useEffect(() => {
    if (guilds && guilds.length > 0) {
      const fetchVideos = async () => {
        setLoadingVideos(true);
        setVideosError(null); // Reset error before fetching
        try {
          const videoPromises = guilds.map(async (guild) => {
            const response = await getGuildVideos(guild.guildId);
            if (!response) {
              throw new Error(`Failed to load videos for guild: ${guild.guildName}`);
            }
            return response;
          });

          const allVideos = await Promise.all(videoPromises);
          setVideos(allVideos.flat());
        } catch (error) {
          setVideosError((error as Error).message);
          setOpenSnackbar(true); // Open snackbar for videos error
        } finally {
          setLoadingVideos(false);
        }
      };

      fetchVideos();
    }
  }, [guilds, getGuildVideos]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      console.log(event)
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div>
      {loadingGuilds ? (
        <LoadingGuilds /> 
      ) : (
        <SubscriptionChannels guilds={guilds} />
      )}
      
      <h1 className='px-6 py-4 text-white text-3xl font-bold'>Latest</h1>
      
      {loadingVideos ? (
        <LoadingState /> 
      ) : (
        <VideoGrid videos={videos} />
      )}

      {/* Snackbar for error handling */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {guildsError ? guildsError : videosError}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Subscriptions;
