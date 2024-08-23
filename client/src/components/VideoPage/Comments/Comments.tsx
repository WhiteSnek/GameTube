import React, { useEffect, useState } from 'react'
import { Comment } from '../../../templates/comment_template'
import SingleComment from './Comment';
import { dummyComments } from '../../constants';

const Comments:React.FC = () => {
  const [comments,setComments] = useState<Comment[]>([]);
  useEffect(()=>{
    setComments(dummyComments)
  },[])
  return (
    <div className='px-10'>
      <h1 className='text-xl text-white font-bold'>{comments.length} Comments</h1>
      {comments.map((comment)=>(
        <SingleComment comment={comment} />
      ))}
    </div>
  )
}

export default Comments
