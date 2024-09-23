import React, { useEffect, useState } from 'react';
import VideoList from './VideoList';
import { useVideo } from '../../../providers/VideoProvider';
import LoadingState from './LoadingState';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Recommended: React.FC = () => {
  const { getAllVideos } = useVideo();
  const [loading, setLoading] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const getVideos = async () => {
      setLoading(true);
      const success: boolean = await getAllVideos();
      if (!success) {
        setErrorMessage('Error retrieving videos');
        setOpenSnackbar(true);
      }
      setLoading(false);
    };
    getVideos();
  }, []);
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className='mx-4'>
      <h1 className='text-lg sm:text-xl font-bold text-white px-4 pt-4'>Recommended</h1>
      {loading ? <LoadingState /> : <VideoList component="video" />}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Recommended;
