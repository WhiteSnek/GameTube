"use client";
import api from "@/lib/axios";
import { UploadVideoType, VideoImages, VideoType } from "@/types/video.types";
import axios from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";



interface VideoContextType {
  videos: VideoType[] | null;
  setVideos: React.Dispatch<React.SetStateAction<VideoType[] | null>>;
  addVideo: (data: UploadVideoType) => Promise<void>;
  uploadFiles: (
    videoUrl: string,
    thumbnailUrl: string,
    videoFile: File,
    thumbnaiFile: File
  ) => Promise<any>;
  getSignedUrls: (
    email: string,
    guild: string
  ) => Promise<{
    videoUrl: string;
    videoKey: string;
    thumbnailUrl: string;
    thumbnailKey: string;
  }>;
  getVideos: (guildId? :string) => Promise<VideoType[] | null>;
  getVideoFiles: (guildIds: string[] ) => Promise<VideoImages[] | null>;
  getVideoById: (videoId: string) => Promise<any>
  getJoinedGuildVideos: () => Promise<VideoType[] | null>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = () => {
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
  const [videos, setVideos] = useState<VideoType[] | null>(null);

  const addVideo = async (data: UploadVideoType): Promise<void> => {
    console.log(data)
    try {
      const response = await api.post("/video/upload", data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFiles = async (
    videoUrl: string,
    thumbnailUrl: string,
    videoFile: File,
    thumbnailFile: File
  ) => {
    try {
      // Upload Video
      await axios.put(videoUrl, videoFile, {
        headers: {
          "Content-Type": videoFile.type,
        },
      });
      console.log("Video uploaded successfully");
      // Upload Thumbnail
      await axios.put(thumbnailUrl, thumbnailFile, {
        headers: {
          "Content-Type": thumbnailFile.type,
        },
      });
      console.log("Thumbnail uploaded successfully");
      return { success: true };
    } catch (error) {
      console.error("Error uploading files:", error);
      return { success: false, error };
    }
  };

  const getSignedUrls = async (email: string, guild: string): Promise<{videoUrl: string, videoKey: string, thumbnailUrl: string, thumbnailKey: string}> => {
    const username = email.split("@")[0];
    const response = await axios.get(
      `http://localhost:8000/image/video/upload-url?email=${username}&guild=${guild}`
    );
    const { videoUrl, videoKey, thumbnailUrl, thumbnailKey } = response.data;
    return { videoUrl, videoKey, thumbnailUrl, thumbnailKey } 
  };

  const getVideos = async(guildId?: string): Promise<VideoType[] | null> => {
    try {
      let response;
      if(guildId){
        response = await api.get(`/video/guild/${guildId}`)
      }
      else response = await api.get("/video/")
      if(response.data.data) return response.data.data
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const getVideoFiles = async (videoIds: string[]): Promise<VideoImages[] | null> => {
    try {
      const response = await api.post("/image/video/images", {videoIds})
      console.log(response.data.videoFiles)
      return response.data.videoFiles
    } catch (error) {
      console.log(error)
      return null
    }
  };

  const getVideoById = async (videoId: string): Promise<any> => {
    try {
      console.log(videoId)
      const response = await api.get(`/video/${videoId}`)
      console.log(response.data.data)
      return response.data.data
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const getJoinedGuildVideos = async (): Promise<VideoType[] | null> => {
    try {
      const response = await api.get("/video/guild/joined")
      console.log(response.data)
      if(response.data.data) return response.data.data
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  return (
    <VideoContext.Provider value={{ videos, setVideos, addVideo, uploadFiles,getSignedUrls, getVideos,getVideoFiles,getVideoById,getJoinedGuildVideos }}>
      {children}
    </VideoContext.Provider>
  );
};

export default VideoProvider;
