'use client';
import React, { useState } from "react";
import { ArrowUp, MessageCircle, PlusCircle } from "lucide-react";

interface CommentType {
  id: number;
  avatar: string;
  name: string;
  role: string;
  comment: string;
  likes: number;
  replies: CommentType[];
}

const initialComments: CommentType[] = [
  {
    id: 1,
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk682wVne-8BYNP-NRr-pOcfkEH1sNjhPgGQ&s",
    name: "Kazuma Kiryu",
    role: "Leader",
    comment: "This is an amazing discussion!",
    likes: 10,
    replies: [
      {
        id: 2,
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPo4dzHh3Zrhq6UeTG9iVMliJSOP4fcyz9qg&s",
        name: "Goro Majima",
        role: "Elder",
        comment: "Totally agree with you!",
        likes: 5,
        replies: [
          {
            id: 3,
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxxkt7iW33OEq0bRwfpXVL7QmXrI4Sba7MvQ&s",
            name: "Bob Jones",
            role: "Member",
            comment: "Same here, this is insightful.",
            likes: 3,
            replies: [],
          },
        ],
      },
    ],
  },
];

const Comment = ({ comment, addReply, depth = 0 }: { comment: CommentType; addReply: (id: number, text: string, depth: number) => void; depth?: number }) => {
  const [likes, setLikes] = useState<number>(comment.likes);
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");

  return (
    <div className="border-l-4 border-zinc-500 dark:border-zinc-700 pl-6 my-4">
      <div className="flex items-start gap-4 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
        <img src={comment.avatar} alt="Avatar" className="w-12 h-12 rounded-full border object-cover" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-white">{comment.name}</span>
            <span className="text-xs bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-white px-3 py-1 rounded-full font-medium">
              {comment.role}
            </span>
          </div>
          <p className="mt-2 text-zinc-800 dark:text-zinc-300">{comment.comment}</p>
          <div className="flex items-center gap-6 mt-3 text-zinc-500 dark:text-zinc-400 text-sm">
            <button onClick={() => setLikes(likes + 1)} className="flex items-center gap-1 hover:text-blue-600">
              <ArrowUp size={16} /> {likes}
            </button>
            {depth < 2 && <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 hover:text-blue-600">
              <MessageCircle size={16} /> {comment.replies.length}
            </button>}
          </div>
          {showReplies && (
            <div className="ml-8 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4 mt-3">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} addReply={addReply} depth={depth + 1} />
              ))}
              {depth < 2 && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 p-2 border rounded-md dark:bg-zinc-700 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (replyText.trim()) {
                        addReply(comment.id, replyText, depth + 1);
                        setReplyText("");
                      }
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Comments = () => {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [newComment, setNewComment] = useState<string>("");

  const addComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          avatar: "https://i1.sndcdn.com/avatars-1F5ymBCxBLO7BeF6-FWifBQ-t1080x1080.jpg",
          name: "Ichiban Kasuga",
          role: "Member",
          comment: newComment,
          likes: 0,
          replies: [],
        },
      ]);
      setNewComment("");
    }
  };

  const addReply = (id: number, text: string, depth: number) => {
    if (depth >= 3) return;
    const updateReplies = (commentsList: CommentType[]): CommentType[] => {
      return commentsList.map((comment) => {
        if (comment.id === id) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: Date.now(),
                avatar: "https://i1.sndcdn.com/avatars-1F5ymBCxBLO7BeF6-FWifBQ-t1080x1080.jpg",
                name: "Ichiban Kasuga",
                role: "Member",
                comment: text,
                likes: 0,
                replies: [],
              },
            ],
          };
        }
        return { ...comment, replies: updateReplies(comment.replies) };
      });
    };
    setComments(updateReplies(comments));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-zinc-900 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-white">Comments</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 p-2 border rounded-md dark:bg-zinc-700 dark:text-white"
        />
        <button
          onClick={addComment}
          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
        >
          <MessageCircle size={25} />
        </button>
      </div>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} addReply={addReply} />
      ))}
    </div>
  );
};

export default Comments;