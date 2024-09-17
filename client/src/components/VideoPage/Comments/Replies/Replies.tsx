import React, { useEffect, useState } from "react";
import { ReplyTemplate } from "../../../../templates/reply_template";
import { useReply } from "../../../../providers/ReplyProvider";
import Reply from "./Reply";
import AddReply from "./AddReply";

interface RepliesProps {
  commentId: string;
}

const Replies: React.FC<RepliesProps> = ({ commentId }) => {
  const [replies, setReplies] = useState<ReplyTemplate[]>([]);
  const { getCommentReplys } = useReply();
  useEffect(() => {
    const getReplies = async () => {
      const response = await getCommentReplys(commentId);
      if (response) {
        setReplies(response);
      } else {
        console.log("Failed to fetch replies!");
      }
    };
    getReplies();
  }, [commentId]);
  return (
    <div className="px-10">
      <h1 className="text-xl text-white font-bold">{replies.length} replies</h1>
      <AddReply commentId={commentId} />
      {replies.map((reply,idx) => (
        <Reply reply={reply} key={idx} />
      ))}
    </div>
  );
};

export default Replies;
