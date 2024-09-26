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
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="flex flex-col mt-[4rem] p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      {/* TagList */}
      <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <TagList activeTag={activeTag} setActiveTag={setActiveTag} />
      </div>

      {/* Video Grid */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="w-full py-4 sm:py-0">
          <VideoGrid videos={video} />
        </div>
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
