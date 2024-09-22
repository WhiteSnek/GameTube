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
  const [loading, setLoading] = useState<boolean>(false)
  const { getVideoComments } = useComment();
  
  useEffect(() => {
    const getComments = async () => {
      try {
        setLoading(true)
        const response = await getVideoComments(videoId);
        if (response) {
          setComments(response);
        } else {
          throw new Error('Failed to load comments');
        }
        setLoading(false)
      } catch (error) {
        setSnackbarMessage((error as Error).message || 'Something went wrong!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    getComments();
  }, [videoId, getVideoComments]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!comments.length) return <div>No comments yet</div>;

  return (
    <div className='px-10'>
      <h1 className='text-xl text-white font-bold'>{comments.length} Comments</h1>
      <AddComment videoId={videoId} />
      {loading ? <LoadingState /> :comments.map((comment) => (
        <SingleComment key={comment.id} comment={comment} />
      ))}
      
      {/* Snackbar for error handling */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Comments;
