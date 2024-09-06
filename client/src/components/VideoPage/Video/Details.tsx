import React, { useState } from 'react'
import { VideoCardTemplate } from '../../../templates/video_templates'
import { Link } from 'react-router-dom'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
// import formatDate from '../../../utils/formatDate';
import formatViews from '../../../utils/formatViews';
interface DetailsProps {
    video: VideoCardTemplate
}

const Details:React.FC<DetailsProps> = ({video}) => {
  console.log(video)
    const [liked,setLiked] = useState<boolean>(false);
    const [saved,setSaved] = useState<boolean>(false);
    const toggleLike = () => {
        setLiked(!liked)
    }
    const toggleSaved = () =>{
        setSaved(!saved);
    }
  return (
    <div className=''>
      <h1 className='text-3xl text-white font-bold py-5'>{video.title}</h1>
      <div className='flex items-center justify-between gap-4'>
      <div className='flex items-center gap-4'>
      <Link to={`/guild/${video.owner.userId}`} className='flex items-center gap-3'>
        <img src={video.owner.avatar} alt={video.owner.name} className='h-8'/>
        <div className=''>
        <h3 className='text-white font-semibold text-lg'>{video.owner.name}</h3>
        <p className='text-sm text-gray-300'>Guild members</p>
        </div>
      </Link>
      <button className='bg-red-500 px-4 py-2 text-md rounded-lg font-bold text-white shadow-xl btn-5 '>Join Guild</button>
      </div>
      <div className='flex gap-4 items-center'>
        <button onClick={toggleLike} className='text-white py-2 px-4 bg-red-500 rounded-full'>{liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon/>}</button>
        <button className='text-white py-2 px-4 bg-red-500 rounded-full'><ShareOutlinedIcon /> Share</button>
        <button className='text-white py-2 px-4 bg-red-500 rounded-full'><DownloadOutlinedIcon/> Download</button>
        <button onClick={toggleSaved}  title='save' className='text-white py-2 px-4 bg-red-500 rounded-full'>{saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}</button>
      </div>
      
      </div>
      <div className='p-4 m-4 bg-zinc-800 rounded-lg'>
        <div className='flex text-white gap-3 text-sm font-bold'>
            <p>{formatViews(video.views)} views</p>
            {/* <p>{formatDate(video.uploadTime)}</p> */}
        </div>
        <p className='text-white '>Description</p>
      </div>
    </div>
  )
}

export default Details
