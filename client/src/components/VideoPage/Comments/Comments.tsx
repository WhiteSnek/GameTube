import React, { useEffect, useState } from 'react';
import SingleComment from './Comment';
import { useComment } from '../../../providers/CommentProvider';
import { CommentTemplate } from '../../../templates/comment_template';
import AddComment from './AddComment';
import { useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import LoadingState from './LoadingState';

const Comments: React.FC = () => {
  const { videoId } = useParams();
  if (!videoId) return <div>Something went wrong...</div>;
  
  const [comments, setComments] = useState<CommentTemplate[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState<boolean>(false);
  const { getVideoComments } = useComment();

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getVideoComments(videoId);
      setLoading(false);
      if (response) {
        setComments(response);
      }
    } catch (error) {
      setSnackbarMessage((error as Error).message || 'Something went wrong!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className='px-10'>
      <h1 className='text-md sm:text-xl text-white sm:font-bold'>{comments.length} Comments</h1>
      {/* Pass fetchComments as a prop to refresh the comments after adding a new one */}
      <AddComment videoId={videoId} onCommentAdded={fetchComments} />
      {loading ? <LoadingState /> : comments.map((comment) => (
        <SingleComment key={comment.id} comment={comment} />
      ))}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Comments;
