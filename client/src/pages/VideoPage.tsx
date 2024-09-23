import React, { useEffect, useState } from "react";
import VideoDetails from "../components/VideoPage/Video/VideoDetails";
import Recommended from "../components/VideoPage/Recommended/Recommended";
import Comments from "../components/VideoPage/Comments/Comments";
import { useParams } from "react-router-dom";
import { useVideo } from "../providers/VideoProvider";
import { VideoDetailsTemplate } from "../templates/video_templates";
import CommentProvider from "../providers/CommentProvider";
import { Snackbar, Alert } from '@mui/material';
import LoadingState from "../components/VideoPage/Video/LoadingState";

const VideoPage: React.FC = () => {
  const { videoId } = useParams();
  const { getVideoDetails } = useVideo();
  const [video, setVideo] = useState<VideoDetailsTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const getVideo = async () => {
      if (!videoId) {
        setSnackbarMessage('Something went wrong...');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      try {
        setLoading(true);
        const response = await getVideoDetails(videoId);
        if (response) {
          setVideo(response);
        } else {
          throw new Error("Error loading video");
        }
      } catch (error) {
        setSnackbarMessage('Failed to load video');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false); // Ensure loading is set to false in both success and error cases
      }
    };

    getVideo();
  }, [videoId, getVideoDetails]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12">
      <div className="col-span-8">
        {loading ? (
          <LoadingState />
        ) : video ? (
          <>
            <VideoDetails video={video} />
            <CommentProvider>
              <Comments />
            </CommentProvider>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className="col-span-4">
        <Recommended />
      </div>

      {/* Snackbar for error notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default VideoPage;
