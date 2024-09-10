import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ReplyTemplate } from '../templates/reply_template';
import axios, { AxiosResponse } from 'axios';

interface ReplyContextType {
    Replys: ReplyTemplate[];
    setReplys: React.Dispatch<React.SetStateAction<ReplyTemplate[]>>;
    addReply: (details: AddReplyProps) => Promise<boolean>
    getCommentReplys: (commentId: string) => Promise<ReplyTemplate[] | null>
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

    return (
        <ReplyContext.Provider value={{Replys, setReplys, addReply, getCommentReplys}}>
            {children}
        </ReplyContext.Provider>
    )
}

export default ReplyProvider