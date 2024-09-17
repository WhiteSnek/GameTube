import React, { useEffect, useState } from 'react'
import SingleComment from './Comment';
import { useComment } from '../../../providers/CommentProvider';
import { CommentTemplate } from '../../../templates/comment_template';
import AddComment from './AddComment';
import { useParams } from 'react-router-dom';

const Comments:React.FC = () => {
  const {videoId} = useParams()
  if(!videoId) return <div>Something went wrong...</div>
  const [comments, setComments] = useState<CommentTemplate[]>([])
  const { getVideoComments} = useComment()
  console.log(videoId)
  useEffect(()=>{
    const getComments = async () => {
      const response = await getVideoComments(videoId);
      if(response){
        setComments(response)
      } else {
        console.log('Something went wrong!')
      }
    }
    getComments();
  },[videoId])
  if(!comments) return <div>No comments yet</div>
  return (
    <div className='px-10'>
      <h1 className='text-xl text-white font-bold'>{comments.length} Comments</h1>
      <AddComment videoId={videoId} />
      {comments.map((comment)=>(
        <SingleComment comment={comment} />
      ))}
    </div>
  )
}

export default Comments
