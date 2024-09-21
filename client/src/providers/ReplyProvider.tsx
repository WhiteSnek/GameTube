import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ReplyTemplate } from '../templates/reply_template';
import axios, { AxiosResponse } from 'axios';

interface likeReplyProps {
    userId: string | undefined;
    entityId: string | undefined;
    entityType: string;
  }

interface ReplyContextType {
    Replys: ReplyTemplate[];
    setReplys: React.Dispatch<React.SetStateAction<ReplyTemplate[]>>;
    addReply: (details: AddReplyProps) => Promise<boolean>
    getCommentReplys: (commentId: string) => Promise<ReplyTemplate[] | null>
    likeReply: (details: likeReplyProps) => Promise<boolean>
  unlikeReply: (details: likeReplyProps) => Promise<boolean>
  replyLiked: (details: likeReplyProps) => Promise<boolean>
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined)

export const useReply = (): ReplyContextType => {
    const context = useContext(ReplyContext);
    if (!context) {
        throw new Error("useReply must be used within a GuildProvider");
    }
    return context;
}

interface ReplyProviderProps {
    children: ReactNode;
  }

interface AddReplyProps {
    content: string;
    commentId: string;
    owner: string;
}

interface AddReplyType {
    id: string;
}

const ReplyProvider: React.FC<ReplyProviderProps> = ({children}) => {
    const [Replys,setReplys] = useState<ReplyTemplate[]>([]);

    const addReply = async (detaiils: AddReplyProps): Promise<boolean> => {
        try {
            const response: AxiosResponse<AddReplyType> = await axios.post(`/replies/protected/addReply`,detaiils, {withCredentials: true})
            console.log(response)
            return true;
        } catch (error) {
            console.error(error)
            return false;
        }
    }

    const getCommentReplys = async(commentId: string): Promise<ReplyTemplate[] | null> => {
        try {
            console.log(commentId)
            const response: AxiosResponse<ReplyTemplate[]> = await axios.get(`/replies/${commentId}`, {withCredentials: true});
            return response.data
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    const likeReply= async(details: likeReplyProps): Promise<boolean> => {
        try {
          const response: AxiosResponse<string> = await axios.post('/likes/protected/add-like',details, {withCredentials: true})
          console.log(response)
          return true;
        } catch (error) {
          return false;
        }
      }
    
      const unlikeReply = async(details: likeReplyProps): Promise<boolean> => {
        try {
          const response: AxiosResponse<string> = await axios.post('/likes/protected/remove-like',details, {withCredentials: true})
          console.log(response)
          return true;
        } catch (error) {
          return false;
        }
      }

      interface CheckLikeResponse {
        isLiked: boolean
      }
    
      const replyLiked = async(details: likeReplyProps): Promise<boolean> => {
        try {
          const response: AxiosResponse<CheckLikeResponse> = await axios.post('/likes/protected/check-like',details, {withCredentials: true})
          return response.data.isLiked
        } catch (error) {
          return false;
        }
      }

    return (
        <ReplyContext.Provider value={{Replys, setReplys, addReply, getCommentReplys, likeReply, unlikeReply, replyLiked}}>
            {children}
        </ReplyContext.Provider>
    )
}

export default ReplyProvider