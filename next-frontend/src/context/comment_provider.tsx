"use client";
import { api } from "@/lib/axios";
import React, { createContext, ReactNode, useContext } from "react";

interface CommentContextType {
  getComments: (videoId: string) => Promise<any>;
  addComment: (videoId: string, content: string, commentTye: "text" | "gif") => Promise<any>;
  getReplies: (commentId: string) => Promise<any>;
  addReply: (commentId: string, content: string, commentType: "text" | "gif") => Promise<any>;
  deleteComment: (commentId: string) => Promise<string>;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const useComment = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useComment must be used within a CommentProvider");
  }
  return context;
};

interface CommentProviderProps {
  children: ReactNode;
}

const CommentProvider: React.FC<CommentProviderProps> = ({ children }) => {
  const getComments = async (videoId: string): Promise<any> => {
    try {
      const response = await api.get(`/comment/video/${videoId}`);
      if (response) return response.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const addComment = async (videoId: string, content: string, commentType: "text" | "gif"): Promise<any> => {
    try {
      const response = await api.post(`/comment/video/${videoId}`, { content, comment_type: commentType });
      if (response) return response.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const getReplies = async (commentId: string): Promise<any> => {
    try {
      const response = await api.get(`/comment/reply/${commentId}`);
      if (response) return response.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const addReply = async (commentId: string, content: string, commentType: "text" | "gif"): Promise<any> => {
    try {
      const response = await api.post(`/comment/reply/${commentId}`, {
        content,
        comment_type: commentType
      });
      if (response) return response.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const deleteComment = async (commentId: string): Promise<string> => {
    try {
      const response = await api.delete(`/comment/${commentId}`);
      if (response.data.data) return response.data.data;
      else throw response.data.error
    } catch (error) {
      console.log(error);
      return `Error: ${error}`
    }
  };

  return (
    <CommentContext.Provider
      value={{ getComments, addComment, getReplies, addReply,deleteComment }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export default CommentProvider;
