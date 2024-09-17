import React, { createContext, ReactNode, useContext, useState } from "react";
import { VideoCardTemplate } from "../templates/video_templates";
import axios, { AxiosResponse } from "axios";

interface likeVideoProps {
  userId: string | undefined;
  entityId: string | undefined;
}

interface VideoContextType {
  video: VideoCardTemplate[];
  setVideo: React.Dispatch<React.SetStateAction<VideoCardTemplate[]>>;
  getVideoDetails: (videoId: string) => Promise<VideoCardTemplate | null>
  getUserVideos: (userId: string) => Promise<VideoCardTemplate[] | null>
  getGuildVideos: (guildId: string) => Promise<VideoCardTemplate[]|null>
  getAllVideos: () => Promise<boolean>
  uploadVideo: (formData: FormData) => Promise<boolean>
  likeVideo: (details: likeVideoProps) => Promise<boolean>
  unlikeVideo: (details: likeVideoProps) => Promise<boolean>
  videoLiked: (details: likeVideoProps) => Promise<boolean>
  searchVideos: (query: string) => Promise<boolean>
  increaseViews: (videoId: string) => Promise<boolean>
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

  const uploadVideo = async (formData: FormData): Promise<boolean> => {
    try {
      const response: AxiosResponse<string> = await axios.post('/videos/protected/upload', formData, {withCredentials: true})
      console.log(response.data)
      return true;
    } catch (error) {
      return false;
    }
  }

  const getVideoDetails = async (videoId: string): Promise<VideoCardTemplate | null> => {
    try {
      const response: AxiosResponse<VideoCardTemplate> = await axios.get(`/videos/${videoId}`, { withCredentials: true });
      return response.data; 
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  const getUserVideos = async(userId: string): Promise<VideoCardTemplate[] | null> => {
    try {
        const response: AxiosResponse<VideoCardTemplate[]> = await axios.get(`/users/videos/${userId}`, {withCredentials: true});
        return response.data
    } catch (error) {
        console.log(error)
        return null;
    }
  }

  const getGuildVideos = async(guildId: string): Promise<VideoCardTemplate[] | null> => {
    try {
        const response: AxiosResponse<VideoCardTemplate[]> = await axios.get(`/guilds/videos/${guildId}`, {withCredentials: true});
        return response.data;
    } catch (error) {
        console.log(error)
        return null;
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

  const likeVideo= async(details: likeVideoProps): Promise<boolean> => {
    try {
      const response: AxiosResponse<string> = await axios.post('/likes/protected/add-like',details, {withCredentials: true})
      console.log(response)
      return true;
    } catch (error) {
      return false;
    }
  }

  const unlikeVideo = async(details: likeVideoProps): Promise<boolean> => {
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

  const videoLiked = async(details: likeVideoProps): Promise<boolean> => {
    try {
      const response: AxiosResponse<CheckLikeResponse> = await axios.post('/likes/protected/check-like',details, {withCredentials: true})
      return response.data.isLiked
    } catch (error) {
      return false;
    }
  }

  const searchVideos = async(query: string):  Promise<boolean> => {
    try {
        const encodedQuery = encodeURIComponent(query);
        const response: AxiosResponse<VideoCardTemplate[]> = await axios.get(`/videos?query=${encodedQuery}`, {withCredentials: true});
        setVideo(response.data)
        console.log(response.data)
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
  }

  const increaseViews = async (videoId: string): Promise<boolean> => {
    try {
      const response: AxiosResponse<string> = await axios.get(`/videos/views/${videoId}`,{withCredentials: true});
      console.log(response)
      return true;
    } catch (error) {
      console.log(error)
      return false;
    }
  }

  return (
    <VideoContext.Provider value={{ video, setVideo, getVideoDetails, getUserVideos,getAllVideos, getGuildVideos, uploadVideo, likeVideo, unlikeVideo, videoLiked, searchVideos, increaseViews}}>
      {children}
    </VideoContext.Provider>
  );
};

export { VideoProvider };
