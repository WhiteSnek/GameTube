import React, { useState } from "react";
import { CommentTemplate } from "../../../templates/comment_template";
// import formatDate from '../../../utils/formatDate'
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Replies from "./Replies/Replies";
import ReplyProvider from "../../../providers/ReplyProvider";

interface CommentProps {
  comment: CommentTemplate;
}

const SingleComment: React.FC<CommentProps> = ({ comment }) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [showReply, setShowReply] = useState<boolean>(false);
  const toggleLike = () => {
    setLiked(!liked);
  };
  const toggleReplies = () => {
    setShowReply(!showReply);
  };
  return (
    <div className="flex justify-start gap-3 p-4 text-white">
      <img
        src={comment.avatar}
        alt={comment.username}
        className="h-8 aspect-square object-cover rounded-full"
      />
      <div>
        <div className="flex gap-4 items-center">
          <h1 className="font-bold">{comment.username}</h1>
          {/* <span className='py-1 px-2 text-xs font-semibold bg-red-500 rounded-full'>{comment.user.userRole}</span> */}
          {/* <p className='text-sm text-gray-400'>{formatDate(comment.created_at)}</p> */}
        </div>
        <p>{comment.content}</p>
        <div className="flex gap-3 items-center py-1">
          <button
            onClick={toggleLike}
            className="text-gray-300 p-2 text-sm rounded-full hover:bg-zinc-700"
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </button>
          <button className="text-gray-300 py-2 px-4 text-sm rounded-full hover:bg-zinc-700">
            Reply
          </button>
          <button
            className="text-gray-300 py-2 px-4 text-sm rounded-full hover:bg-zinc-700"
            onClick={toggleReplies}
          >
            {showReply ? (
              <p>
                Hide replies <ExpandLessIcon />
              </p>
            ) : (
              <p>
                Show replies <ExpandMoreIcon />
              </p>
            )}
          </button>
        </div>
        {showReply && (
          <ReplyProvider>
            <Replies commentId={comment.id} />
          </ReplyProvider>
        )}
      </div>
    </div>
  );
};

export default SingleComment;
