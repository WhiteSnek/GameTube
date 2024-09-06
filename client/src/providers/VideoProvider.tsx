import React, { createContext, ReactNode, useContext, useState } from "react";
import { VideoCardTemplate } from "../templates/video_templates";
import axios, { AxiosResponse } from "axios";

interface VideoContextType {
  video: VideoCardTemplate[];
  setVideo: React.Dispatch<React.SetStateAction<VideoCardTemplate[]>>;
  getVideoDetails: (videoId: string) => Promise<boolean>
  getUserVideos: (userId: string) => Promise<boolean>
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

  const getVideoDetails = async(videoId: string): Promise<boolean> => {
    try {
        const response: AxiosResponse<VideoCardTemplate> = await axios.get(`/videos/${videoId}`, {withCredentials: true});
        setVideo([response.data])
        return true;
    } catch (error) {
        console.log(error)
        return false;
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

  return (
    <VideoContext.Provider value={{ video, setVideo, getVideoDetails, getUserVideos }}>
      {children}
    </VideoContext.Provider>
  );
};

export { VideoProvider };
