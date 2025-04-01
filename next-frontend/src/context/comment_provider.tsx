"use client";
import api from "@/lib/axios";
import React, { createContext, ReactNode, useContext } from "react";

interface CommentContextType {
    getComments: (videoId: string) => Promise<any>;
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

  return (
    <CommentContext.Provider value={{getComments}}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentProvider;
