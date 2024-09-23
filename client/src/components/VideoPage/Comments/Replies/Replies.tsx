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

  // Function to fetch replies
  const fetchReplies = async () => {
    const response = await getCommentReplys(commentId);
    if (response) {
      setReplies(response);
    } else {
      console.log("Failed to fetch replies!");
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [commentId]);

  return (
    <div className="sm:px-10">
      <h1 className="text-md sm:text-xl text-white sm:font-bold">{replies.length} replies</h1>
      {/* Pass fetchReplies as a prop to refresh the replies after adding a new one */}
      <AddReply commentId={commentId} onReplyAdded={fetchReplies} />
      {replies.map((reply, idx) => (
        <Reply reply={reply} key={idx} />
      ))}
    </div>
  );
};

export default Replies;
