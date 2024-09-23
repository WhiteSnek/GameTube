import React, { useState } from 'react';
import { useUser } from '../../../providers/UserProvider';
import { useComment } from '../../../providers/CommentProvider';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface AddCommentProp {
  videoId: string;
  onCommentAdded: () => void; // New prop to notify parent component
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddComment: React.FC<AddCommentProp> = ({ videoId, onCommentAdded }) => {
  const [content, setContent] = useState<string>('');
  const { user } = useUser();
  const { addComment } = useComment();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  if (!user) {
    return <div className='text-white text-sm sm:text-lg p-4 m-2 border-2 border-white rounded-md bg-zinc-800'>Login to add a comment...</div>;
  }

  const handleSubmit = async () => {
    if (content === '') {
      setSnackbarMessage('Please add some content!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const details = {
      content,
      videoID: videoId,
      owner: user.id,
    };
    const success: boolean = await addComment(details);
    if (success) {
      setSnackbarMessage('Comment added successfully');
      setSnackbarSeverity('success');
      setContent('');
      onCommentAdded(); // Call the callback to fetch comments again
    } else {
      setSnackbarMessage('Failed to add comment!');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className='flex items-center'>
      <img src={user.avatar} alt='avatar' className='h-8 aspect-square object-cover rounded-full' />
      <input
        type='text'
        placeholder='Add a comment...'
        className='m-2 bg-transparent border-b-2 border-white w-full text-lg p-2 focus:outline-none text-white'
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className='bg-white text-black px-2 sm:px-4 py-1 w-10 sm:w-20 sm:h-10 rounded-md text-xs sm:text-lg'
        onClick={handleSubmit}
      >
        Post
      </button>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddComment;
