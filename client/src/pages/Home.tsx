import React, { useEffect, useState } from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';
import { useVideo } from '../providers/VideoProvider';
import LoadingState from '../components/VideoGrid/LoadingState';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

// Helper for MuiAlert to avoid direct usage in JSX
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Home: React.FC = () => {
  const { video, getAllVideos, getVideosByTags } = useVideo();
  const [activeTag, setActiveTag] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  // Function to fetch videos based on active tag
  const fetchVideos = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      let success: boolean;
      if (activeTag !== 'all') {
        success = await getVideosByTags(activeTag);
      } else {
        success = await getAllVideos();
      }

      if (!success) {
        throw new Error('Error loading videos');
      }
    } catch (err) {
      setError((err as Error).message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeTag]);

  // Handle Snackbar close
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === 'clickaway') {
      console.log(event)  
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="mt-[8rem]">
      <TagList activeTag={activeTag} setActiveTag={setActiveTag} />
      {loading ? (
        <LoadingState />
      ) : (
        <VideoGrid videos={video} />
      )}

      {/* Snackbar for displaying error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
