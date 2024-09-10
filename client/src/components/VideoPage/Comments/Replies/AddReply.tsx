import React, { useState } from 'react'
import { useUser } from '../../../../providers/UserProvider'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { useReply } from '../../../../providers/ReplyProvider'

interface AddReplyProp {
    commentId : string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddReply: React.FC<AddReplyProp> = ({ commentId }) => {
    const [content, setContent] = useState<string>('')
    const { user } = useUser()
    const { addReply } = useReply()
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

    if (!user) {
        return <div className='text-white text-lg p-4 m-2 border-2 border-white rounded-md bg-zinc-800'>Login to add a reply...</div>
    }

    const handleSubmit = async () => {
        if (content === '') {
            setSnackbarMessage('Please add some content!')
            setSnackbarSeverity('error')
            setSnackbarOpen(true)
            return
        }
        const details = {
            content,
            commentId,
            owner: user.id,
        }
        const success: boolean = await addReply(details)
        if (success) {
            setSnackbarMessage('Reply added successfully')
            setSnackbarSeverity('success')
            setContent('')
        } else {
            setSnackbarMessage('Failed to add reply!')
            setSnackbarSeverity('error')
        }
        setSnackbarOpen(true)
    }

    const handleSnackbarClose = () => {
        setSnackbarOpen(false)
    }

    return (
        <div className='flex items-center'>
            <img src={user.avatar} alt='avatar' className='h-8 aspect-square object-cover rounded-full' />
            <input
                type='text'
                placeholder='Add a reply...'
                className='m-2 bg-transparent border-b-2 border-white w-full text-sm p-2 focus:outline-none text-white'
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button
                className='bg-white text-black px-2 py-1 w-20 h-10 rounded-md text-sm'
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
    )
}

export default AddReply
