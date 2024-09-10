import React, { useState } from "react";
import { ReplyTemplate } from "../../../../templates/reply_template";
// import formatDate from '../../../utils/formatDate'
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";

interface ReplyProps {
    reply: ReplyTemplate;
  }

const Reply: React.FC<ReplyProps> = ({ reply }) => {
  const [liked, setLiked] = useState<boolean>(false);
  const toggleLike = () => {
    setLiked(!liked);
  };
  return (
    <div className="flex justify-start gap-3 p-4 text-white">
      <img
        src={reply.avatar}
        alt={reply.username}
        className="h-8 aspect-square object-cover rounded-full"
      />
      <div>
        <div className="flex gap-4 items-center">
          <h1 className="font-bold">{reply.username}</h1>
          {/* <span className='py-1 px-2 text-xs font-semibold bg-red-500 rounded-full'>{reply.user.userRole}</span> */}
          {/* <p className='text-sm text-gray-400'>{formatDate(reply.created_at)}</p> */}
        </div>
        
        <div className="flex justify-between w-full items-center py-1">
        <p>{reply.content}</p>
          <button
            onClick={toggleLike}
            className="text-gray-300 p-2 text-sm rounded-full hover:bg-zinc-700"
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reply;
