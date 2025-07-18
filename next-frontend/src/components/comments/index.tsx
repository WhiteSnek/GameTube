"use client";
import React, { useEffect, useState } from "react";
import { ArrowUp, EllipsisVertical, MessageCircle, Trash } from "lucide-react";
import { useComment } from "@/context/comment_provider";
import { useUser } from "@/context/user_provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
interface CommentType {
  id: string;
  ownerAvatar: string;
  ownerName: string;
  role: string;
  content: string;
  likes: number;
  replies: number;
}

const Comment = ({
  comment,
  depth = 0,
}: {
  comment: CommentType;
  depth?: number;
}) => {
  const [replyCount, setReplyCount] = useState<number>(0);
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const { getReplies, addReply, deleteComment } = useComment();
  const { getMultipleUserAvatars } = useUser();
  const [likes, setLikes] = useState<number>(comment.likes);
  const [liked, setLiked] = useState<boolean>(true);
  const { addLike, removeLike, getLike } = useUser();
  const entityType = depth > 0 ? "reply" : "comment"
  useEffect(() => {
    const handleIsLiked = async () => {
      const response = await getLike(comment.id, entityType);
      setLiked(response);
    };
    handleIsLiked();
  }, []);
  const handleToggleLike = async () => {
    let response;
    if (liked) {
      response = await removeLike(comment.id, entityType);
      setLiked(false);
      setLikes((likes) => likes - 1);
    } else {
      response = await addLike(comment.id, entityType);
      setLiked(true);
      setLikes((likes) => likes + 1);
    }
  };
  useEffect(() => {
    const fetchReplies = async () => {
      const response = await getReplies(comment.id);
      if (response && response.length > 0) {
        setReplies(response);
        setReplyCount(response.length);
        // Fetch avatars only once after fetching replies
        getUserAvatars(response);
      }
    };
    fetchReplies();
  }, [comment.id, getReplies]);

  const getUserAvatars = async (loadedReplies: CommentType[]) => {
    const avatarKeys = loadedReplies.map((reply) => reply.ownerAvatar);
    if (avatarKeys.length === 0) return;

    const avatarUrls = await getMultipleUserAvatars(avatarKeys);
    if (!avatarUrls) return;

    setReplies((prevReplies) =>
      prevReplies.map((reply, idx) => ({
        ...reply,
        ownerAvatar: avatarUrls[idx] ?? reply.ownerAvatar,
      }))
    );
  };
  const addCommentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      const response = await addReply(comment.id, replyText);
      if (response) {
        // Fetch avatar immediately after adding reply
        const avatarUrls = await getMultipleUserAvatars([response.ownerAvatar]);
        if (!avatarUrls) return;
        setReplies([
          ...replies,
          {
            ...response,
            ownerAvatar: avatarUrls[0] ?? response.ownerAvatar, // Update avatar for the new reply
          },
        ]);
        setReplyText("");
        setReplyCount((replyCount) => replyCount + 1);
      }
    } else {
      // TODO: Error handling
      return;
    }
  };

  const handleDeleteComment = async () => {
    const response = await deleteComment(comment.id);
    console.log(response);
  };

  return (
    <div className="border-l-4 border-zinc-500 dark:border-zinc-700 pl-6 my-4">
      <div className="flex items-start gap-4 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
        <img
          src={comment.ownerAvatar}
          alt="Avatar"
          className="w-12 h-12 rounded-full border object-cover"
        />
        <div className="w-full">
          <div className="flex justify-between items-center w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-white">
                  {comment.ownerName}
                </span>
                <span className="text-xs bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-white px-3 py-1 rounded-full font-medium">
                  {comment.role}
                </span>
              </div>
              <p className="mt-2 text-zinc-800 dark:text-zinc-300">
                {comment.content}
              </p>
            </div>
            <div>
              <DropdownMenu
                open={showSetting}
                onOpenChange={() => setShowSetting(!showSetting)}
              >
                <DropdownMenuTrigger asChild>
                  <button className="dark:hover:bg-zinc-900 p-2 rounded-full cursor-pointer transition-all">
                    <EllipsisVertical />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="shadow-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <DropdownMenuLabel className="text-sm ">
                    <button
                      className="flex justify-center items-end gap-2 cursor-pointer"
                      onClick={handleDeleteComment}
                    >
                      <Trash size={20} />
                      Delete Comment
                    </button>
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3 text-zinc-500 dark:text-zinc-400 text-sm">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1 hover:text-blue-600 ${liked ? "text-red-500" : ""}`}
            >
              <ArrowUp size={16} />{likes}
            </button>
            {depth < 4 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <MessageCircle size={16} /> {replyCount}
              </button>
            )}
          </div>
          {showReplies && (
            <div className=" dark:border-zinc-700 ">
              {replies.map((reply) => (
                <Comment key={reply.id} comment={reply} depth={depth + 1} />
              ))}
              {depth < 4 && (
                <form className="mt-3 flex gap-2" onSubmit={addCommentReply}>
                  <input
                    type="text"
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 p-2 border rounded-md dark:bg-zinc-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <MessageCircle size={20} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Comments = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const { getComments, addComment } = useComment();
  const { getMultipleUserAvatars } = useUser();
  useEffect(() => {
    const fetchComments = async () => {
      const response = await getComments(videoId);
      if (response && response.length > 0) {
        setComments(response);

        // Fetch avatars only once after fetching comments
        getUserAvatars(response);
      }
    };
    fetchComments();
  }, [videoId, getComments]);

  const getUserAvatars = async (loadedComments: CommentType[]) => {
    const avatarKeys = loadedComments.map((comment) => comment.ownerAvatar);
    if (avatarKeys.length === 0) return;

    const avatarUrls = await getMultipleUserAvatars(avatarKeys);
    if (!avatarUrls) return;

    setComments((prevComments) =>
      prevComments.map((comment, idx) => ({
        ...comment,
        ownerAvatar: avatarUrls[idx] ?? comment.ownerAvatar,
      }))
    );
  };
  const addVideoComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const response = await addComment(videoId, newComment);
      console.log(response);
      if (response) {
        // Fetch avatar immediately after adding comment
        const avatarUrls = await getMultipleUserAvatars([response.ownerAvatar]);
        if (!avatarUrls) return;
        setComments([
          ...comments,
          {
            ...response,
            ownerAvatar: avatarUrls[0] ?? response.ownerAvatar, // Update avatar for the new comment
          },
        ]);
        setNewComment("");
      }
    } else {
      // TODO: Error handling
      return;
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-zinc-900 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-white">
        Comments
      </h2>
      <form className="mb-4 flex gap-2" onSubmit={addVideoComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 p-2 border rounded-md dark:bg-zinc-700 dark:text-white focus:outline-none"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
        >
          <MessageCircle size={25} />
        </button>
      </form>
      {!comments || comments.length === 0 ? (
        <p className="text-center text-zinc-500">
          This section feels like a ghost town. Add a comment to bring it to
          life!
        </p>
      ) : (
        comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
};

export default Comments;
