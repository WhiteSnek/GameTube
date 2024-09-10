import React, { createContext, ReactNode, useContext, useState } from 'react';
import { CommentTemplate } from '../templates/comment_template'
import axios, { AxiosResponse } from 'axios';

interface CommentContextType {
    comments: CommentTemplate[];
    setComments: React.Dispatch<React.SetStateAction<CommentTemplate[]>>;
    addComment: (details: AddCommentProps) => Promise<boolean>
    getVideoComments: (videoId: string) => Promise<CommentTemplate[] | null>
}

const CommentContext = createContext<CommentContextType | undefined>(undefined)

export const useComment = (): CommentContextType => {
    const context = useContext(CommentContext);
    if (!context) {
        throw new Error("useComment must be used within a GuildProvider");
    }
    return context;
}

interface CommentProviderProps {
    children: ReactNode;
  }

interface AddCommentProps {
    content: string;
    videoID: string;
    owner: string;
}

interface AddCommentType {
    status: string;
    id: string;
}

const CommentProvider: React.FC<CommentProviderProps> = ({children}) => {
    const [comments,setComments] = useState<CommentTemplate[]>([]);

    const addComment = async (detaiils: AddCommentProps): Promise<boolean> => {
        try {
            const response: AxiosResponse<AddCommentType> = await axios.post(`/comments/protected/addComment`,detaiils, {withCredentials: true})
            console.log(response)
            return true;
        } catch (error) {
            console.error(error)
            return false;
        }
    }

    const getVideoComments = async(videoId: string): Promise<CommentTemplate[] | null> => {
        try {
            console.log(videoId)
            const response: AxiosResponse<CommentTemplate[]> = await axios.get(`/comments/${videoId}`, {withCredentials: true});
            return response.data
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    return (
        <CommentContext.Provider value={{comments, setComments, addComment, getVideoComments}}>
            {children}
        </CommentContext.Provider>
    )
}

export default CommentProvider