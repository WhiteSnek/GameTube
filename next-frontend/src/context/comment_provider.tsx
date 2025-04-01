"use client";
import api from "@/lib/axios";
import React, { createContext, ReactNode, useContext } from "react";

interface CommentContextType {
    getComments: (videoId: string) => Promise<any>;
    addComment: (videoId: string, content: string) => Promise<any>;
    getReplies: (commentId: string) => Promise<any>;
    addReply: (commentId: string, content: string) => Promise<any>;
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
            const response = await api.get(`/comment/${videoId}`)
            if(response) return response.data.data
        } catch (error) {
            console.log(error)
        }
    }

  const addComment = async(videoId: string, content: string): Promise<any> => {
    try {
      const response = await api.post(`/comment/${videoId}`, {content})
      if (response) return response.data.data
    } catch (error) {
      console.log(error)
    }
  }

  const getReplies = async (commentId: string): Promise<any> => {
    try {
        const response = await api.get(`/comment/reply/${commentId}`)
        if(response) return response.data.data
    } catch (error) {
        console.log(error)
    }
}

const addReply = async(commentId: string, content: string): Promise<any> => {
try {
  const response = await api.post(`/comment/reply/${commentId}`, {content})
  if (response) return response.data.data
} catch (error) {
  console.log(error)
}
}

  return (
    <CommentContext.Provider value={{getComments,addComment, getReplies, addReply}}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentProvider;
