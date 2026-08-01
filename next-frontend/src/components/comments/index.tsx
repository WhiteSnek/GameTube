"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowBigUp,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Smile,
  Trash
} from "lucide-react";
import { useComment } from "@/context/comment_provider";
import { useUser } from "@/context/user_provider";
import { useVideo } from "@/context/video_provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { DefaultAvatar } from "@/assets";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";

interface CommentType {
  id: string;
  ownerAvatar: string;
  ownerName: string;
  role: string;
  content: string;
  likes: number;
  replies: number;
}

// Falls back to DefaultAvatar whenever ownerAvatar is missing, null, or an empty/whitespace string
const getAvatarSrc = (avatar?: string | null) =>
  avatar && avatar.trim() !== "" ? avatar : DefaultAvatar;

const Comment = ({
  comment,
  depth = 0,
}: {
  comment: CommentType;
  depth?: number;
}) => {
  const [replyCount, setReplyCount] = useState<number>(0);
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const { getReplies, addReply, deleteComment } = useComment();
  const { getMultipleUserAvatars } = useUser();
  const { seekTo } = useVideo();

  // regex matches hh:mm:ss or mm:ss
  // capturing group so split() will include the matched timestamps in the array
  const TIMESTAMP_REGEX = /(\b\d{1,2}:\d{2}(?::\d{2})?\b)/; // no global flag to avoid lastIndex side-effects

  const timestampToSeconds = (t: string): number => {
    const parts = t.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const renderContentWithTimestamps = (text: string) => {
    if (!text) return null;
    const parts = text.split(TIMESTAMP_REGEX);
    return parts.map((part, idx) => {
      const isTimestamp = TIMESTAMP_REGEX.test(part);
      if (isTimestamp) {
        const seconds = timestampToSeconds(part);
        return (
          <button
            key={idx}
            onClick={() => seekTo(seconds, true)}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
            title={`Jump to ${part}`}
          >
            {part}
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };
  const [likes, setLikes] = useState<number>(comment.likes);
  const [liked, setLiked] = useState<boolean>(true);
  const { addLike, removeLike, getLike } = useUser();
  const entityType = depth > 0 ? "reply" : "comment";
  const [emojiOpen, setEmojiOpen] = useState<boolean>(false);
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
        ownerAvatar: getAvatarSrc(avatarUrls[idx] ?? reply.ownerAvatar),
      })),
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
            ownerAvatar: getAvatarSrc(avatarUrls[0] ?? response.ownerAvatar), // Update avatar for the new reply
          },
        ]);
        setReplyText("");
        setReplyCount((replyCount) => replyCount + 1);
        setShowReplies(true);
        setShowReplyBox(false);
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

  // Reddit-style avatar shrink + YouTube-style tight indent per depth
  const avatarSize = depth === 0 ? 40 : 32;

  return (
    <div className="relative">
      {/* Reddit-style thread line connecting this node to its parent */}
      {depth > 0 && (
        <div className="absolute left-[-17px] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
      )}
      <div className="group flex items-start gap-3 py-3">
        <img
          src={getAvatarSrc(comment.ownerAvatar)}
          alt="Avatar"
          style={{ width: avatarSize, height: avatarSize }}
          className="rounded-full object-cover flex-shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {comment.ownerName}
              </span>
              {comment.role && (
                <span className="text-[11px] leading-none bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                  {comment.role}
                </span>
              )}
            </div>
            <DropdownMenu
              open={showSetting}
              onOpenChange={() => setShowSetting(!showSetting)}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-full transition-opacity cursor-pointer"
                  aria-label="Comment options"
                >
                  <EllipsisVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="shadow-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <DropdownMenuLabel className="text-sm">
                  <button
                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleDeleteComment}
                  >
                    <Trash size={16} />
                    Delete
                  </button>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200 leading-snug break-words">
            {renderContentWithTimestamps(comment.content)}
          </p>

          <div className="flex items-center gap-4 mt-1.5 text-zinc-500 dark:text-zinc-400">
            <button
              onClick={handleToggleLike}
              aria-label="Like"
              className={`flex items-center gap-1 rounded-full px-1.5 py-1 -ml-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                liked ? "text-orange-600 dark:text-orange-400" : ""
              }`}
            >
              <ArrowBigUp
                size={16}
                fill={liked ? "currentColor" : "none"}
              />
              <span className="text-xs font-medium">{likes}</span>
            </button>

            {depth < 4 && (
              <button
                onClick={() => setShowReplyBox((v) => !v)}
                className="text-xs font-semibold uppercase tracking-wide hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Inline reply box, YouTube-style: hidden until "Reply" is clicked */}
          {showReplyBox && (
            <form
              className="mt-3 flex items-start gap-2"
              onSubmit={addCommentReply}
            >
              <div className="relative flex-1 flex items-center border-b border-zinc-300 dark:border-zinc-600 focus-within:border-zinc-900 dark:focus-within:border-zinc-100 transition-colors">
                <input
                  autoFocus
                  type="text"
                  placeholder="Add a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 py-1.5 text-sm bg-transparent dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  onClick={() => setEmojiOpen((prev) => !prev)}
                  aria-label="Add emoji"
                >
                  <Smile size={18} />
                </button>
                {emojiOpen && (
                  <div className="absolute top-full mt-2 right-0 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setReplyText((prev) => prev + emojiData.emoji)
                      }
                      theme={Theme.DARK}
                      emojiStyle={EmojiStyle.NATIVE}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReplyBox(false);
                  setReplyText("");
                }}
                className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors"
              >
                Reply
              </button>
            </form>
          )}

          {/* View replies toggle, YouTube-style chevron pill */}
          {replyCount > 0 && depth < 4 && (
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-full px-2 py-1 -ml-2 transition-colors"
            >
              {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showReplies
                ? "Hide replies"
                : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
            </button>
          )}

          {showReplies && replies.length > 0 && (
            <div className="mt-2 ml-3 pl-4">
              {replies.map((reply) => (
                <Comment key={reply.id} comment={reply} depth={depth + 1} />
              ))}
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
  const [emojiOpen, setEmojiOpen] = useState<boolean>(false);
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
        ownerAvatar: getAvatarSrc(avatarUrls[idx] ?? comment.ownerAvatar),
      })),
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
            ownerAvatar: getAvatarSrc(avatarUrls[0] ?? response.ownerAvatar), // Update avatar for the new comment
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
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-lg">
      <h2 className="text-lg font-semibold mb-5 text-zinc-900 dark:text-white">
        {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
      </h2>

      <form className="mb-6 flex items-start gap-3" onSubmit={addVideoComment}>
        <div className="relative flex-1 flex items-center border-b border-zinc-300 dark:border-zinc-600 focus-within:border-zinc-900 dark:focus-within:border-zinc-100 transition-colors">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 py-2 text-sm bg-transparent dark:text-white focus:outline-none"
          />
          <button
            type="button"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            onClick={() => setEmojiOpen((prev) => !prev)}
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
          {emojiOpen && (
            <div className="absolute top-full mt-2 right-0 z-50">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setNewComment((prev) => prev + emojiData.emoji)
                }
                theme={Theme.DARK}
                emojiStyle={EmojiStyle.NATIVE}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          Comment
        </button>
      </form>

      {!comments || comments.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-8">
          This section feels like a ghost town. Add a comment to bring it to
          life!
        </p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;