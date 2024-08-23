import React, { useState } from 'react'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
const ButtonGroup: React.FC = () => {
    const [saved,setSaved] = useState<boolean>(false);
    const toggleSaved = () =>{
        setSaved(!saved);
    }
    const buttonStyle: string = 'rounded-full h-11 aspect-square flex justify-center items-center bg-gray-400/60 hover:bg-gray-300/30 text-white';
  return (
    <div className='flex gap-2 items-center py-4'>
      <button onClick={toggleSaved}  className={buttonStyle} title='save'>{saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}</button>
      <button className={buttonStyle} title='share'><ShareOutlinedIcon /></button>
      <button className={buttonStyle} title='download'><DownloadOutlinedIcon /></button>
      <button className={buttonStyle} title='more'><MoreVertOutlinedIcon /></button>
    </div>
  )
}

export default ButtonGroup;
