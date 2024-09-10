import React, { createContext, ReactNode, useContext, useState } from "react";
import { VideoCardTemplate } from "../templates/video_templates";
import axios, { AxiosResponse } from "axios";

interface VideoContextType {
  video: VideoCardTemplate[];
  setVideo: React.Dispatch<React.SetStateAction<VideoCardTemplate[]>>;
  getVideoDetails: (videoId: string) => Promise<VideoCardTemplate | null>
  getUserVideos: (userId: string) => Promise<boolean>
  getGuildVideos: (guildId: string) => Promise<boolean>
  getAllVideos: () => Promise<boolean>
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};

interface VideoProviderProps {
  children: ReactNode;
}

const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [video, setVideo] = useState<VideoCardTemplate[]>([]);

  const getVideoDetails = async (videoId: string): Promise<VideoCardTemplate | null> => {
    try {
      const response: AxiosResponse<VideoCardTemplate> = await axios.get(`/videos/${videoId}`, { withCredentials: true });
      return response.data; 
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  const getUserVideos = async(userId: string): Promise<boolean> => {
    try {
        const response: AxiosResponse<VideoCardTemplate[]> = await axios.get(`/users/videos/${userId}`, {withCredentials: true});
        setVideo(response.data)
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
  }

  const getGuildVideos = async(guildId: string): Promise<boolean> => {
    try {
        const response: AxiosResponse<VideoCardTemplate[]> = await axios.get(`/guilds/videos/${guildId}`, {withCredentials: true});
        setVideo(response.data)
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
  }

  const getAllVideos = async(): Promise<boolean> => {
    try {
        const response: AxiosResponse<VideoCardTemplate[]> = await axios.get(`/videos`, {withCredentials: true});
        
        setVideo(response.data)
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
  }

  return (
    <VideoContext.Provider value={{ video, setVideo, getVideoDetails, getUserVideos,getAllVideos, getGuildVideos}}>
      {children}
    </VideoContext.Provider>
  );
};

export { VideoProvider };
