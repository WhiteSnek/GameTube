import React, { useState, useCallback, useEffect } from "react";
import { CommentTemplate } from "../../../templates/comment_template";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Replies from "./Replies/Replies";
import ReplyProvider from "../../../providers/ReplyProvider";
import { useUser } from "../../../providers/UserProvider";
import { useComment } from "../../../providers/CommentProvider";
import formatDate from "../../../utils/formatDate";

interface CommentProps {
  comment: CommentTemplate;
}

const SingleComment: React.FC<CommentProps> = ({ comment }) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [showReply, setShowReply] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(comment.likes);
  const {user} = useUser()
  const {likeComment, unlikeComment, commentLiked} = useComment()

  useEffect(()=>{
    const details = { userId: user?.id, entityId: comment.id, entityType: "comment"  };
    const checkLike = async () => {
      const response = await commentLiked(details);
      setLiked(response)
    }
    checkLike()
  },[])

  const toggleLike = useCallback(async () => {
    if (liked) {
      await removeLike();
    } else {
      await addLike();
    }
  }, [liked, comment.id, user?.id, likeComment, unlikeComment]);

  const removeLike = async () => {
    if (!user?.id) return;
    const details = { userId: user.id, entityId: comment.id, entityType: "comment" };
    const success = await unlikeComment(details);
    if (success) {
      setLikeCount(likeCount - 1);
      setLiked(false);
    } else {
      console.error('Failed to remove like.');
    }
  };

  const addLike = async () => {
    if (!user?.id) return;
    const details = { userId: user.id, entityId: comment.id, entityType: "comment"  };
    const success = await likeComment(details);
    if (success) {
      setLikeCount(likeCount + 1);
      setLiked(true);
    } else {
      console.error('Failed to add like.');
    }
  };
  const toggleReplies = () => {
    setShowReply(!showReply);
  };
  return (
    <div className="flex justify-start gap-3 py-2 sm:p-4 text-white">
      <img
        src={comment.avatar}
        alt={comment.username}
        className="h-8 aspect-square object-cover rounded-full"
      />
      <div>
        <div className="flex gap-4 items-center">
          <h1 className="font-bold">{comment.username}</h1>
          {/* <span className='py-1 px-2 text-xs font-semibold bg-red-500 rounded-full'>{comment.user.userRole}</span> */}
          <p className='text-sm text-gray-400'>{formatDate(comment.created_at)}</p>
        </div>
        <p>{comment.content}</p>
        <div className="flex gap-1 sm:gap-3 items-center py-1">
          <button
            onClick={toggleLike}
            className="text-gray-300 p-2 text-sm rounded-full hover:bg-zinc-700 flex gap-1 sm:gap-3 items-center"
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />} {likeCount}
          </button>
          <button
            className="text-gray-300 py-2 px-4 text-xs sm:text-sm rounded-full hover:bg-zinc-700 flex"
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
