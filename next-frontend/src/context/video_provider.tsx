"use client";
import api from "@/lib/axios";
import { UploadVideoType, VideoImages, VideoType } from "@/types/video.types";
import axios from "axios";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface VideoContextType {
  videos: VideoType[];
  setVideos: React.Dispatch<React.SetStateAction<VideoType[]>>;
  addVideo: (data: UploadVideoType) => Promise<void>;
  uploadFiles: (
    videoUrl: string,
    thumbnailUrl: string,
    videoFile: File,
    thumbnaiFile: File,
    setProgress: React.Dispatch<React.SetStateAction<number>>
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
  getVideos: (guildId?: string) => Promise<VideoType[]>;
  getVideoFiles: (guildIds: string[]) => Promise<VideoImages[]>;
  getVideoById: (videoId: string) => Promise<any>;
  getJoinedGuildVideos: () => Promise<VideoType[]>;
  getLikedVideos: () => Promise<VideoType[]>;
  searchVideos: (query: string) => Promise<VideoType[]>;
  addView: (videoId: string) => Promise<string>;
  addToWatchLater: (videoId: string) => Promise<string>;
  removeFromWatchLater: (videoId: string) => Promise<string>;
  checkVideoInWatchLater: (videoId: string) => Promise<boolean>;
  removeFromHistory: (entityId: string) => Promise<string>;
  checkVideo: (key: string) => Promise<boolean>;
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
  const [videos, setVideos] = useState<VideoType[]>([]);

  const addVideo = async (data: UploadVideoType): Promise<void> => {
    console.log(data);
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
    thumbnailFile: File,
    setProgress: React.Dispatch<React.SetStateAction<number>>
  ) => {
    try {
      // Upload Video
      await axios.put(videoUrl, videoFile, {
        headers: {
          "Content-Type": videoFile.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);  
          }
        }
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

  const getSignedUrls = async (
    email: string,
    guild: string
  ): Promise<{
    videoUrl: string;
    videoKey: string;
    thumbnailUrl: string;
    thumbnailKey: string;
  }> => {
    const username = email.split("@")[0];
    const response = await axios.get(
      `http://localhost:8000/image/video/upload-url?email=${username}&guild=${guild}`
    );
    const { videoUrl, videoKey, thumbnailUrl, thumbnailKey } = response.data;
    return { videoUrl, videoKey, thumbnailUrl, thumbnailKey };
  };

  const getVideos = async (guildId?: string): Promise<VideoType[]> => {
    try {
      let response;
      if (guildId) {
        response = await api.get(`/video/guild/${guildId}`);
      } else response = await api.get("/video/");
      if (response.data.data) return response.data.data;
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getVideoFiles = async (
    videoIds: string[]
  ): Promise<VideoImages[]> => {
    try {
      const response = await api.post("/image/video/images", { videoIds });
      console.log(response.data.videoFiles);
      return response.data.videoFiles;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getVideoById = async (videoId: string): Promise<any> => {
    try {
      console.log(videoId);
      const response = await api.get(`/video/${videoId}`);
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getJoinedGuildVideos = async (): Promise<VideoType[]> => {
    try {
      const response = await api.get("/video/guild/joined");
      console.log(response.data);
      if (response.data.data) return response.data.data;
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getLikedVideos = async (): Promise<VideoType[]> => {
    try {
      const response = await api.get("/video/liked");
      if (response.data.data) return response.data.data;
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const searchVideos = async (query: string): Promise<VideoType[]> => {
    try {
      const response = await api.get(
        `/video/search?q=${encodeURIComponent(query)}`
      );
      if (response.data.data) return response.data.data;
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const addView = async (videoId: string): Promise<string> => {
    try {
      const response = await api.patch(`/video/view/${videoId}`);
      if (response) return response.data.message;
      return "error";
    } catch (error) {
      console.log(error);
      return "error";
    }
  };

  const addToWatchLater = async (videoId: string): Promise<string> => {
    try {
      const response = await api.post(`/video/watchlater/${videoId}`);
      if (response) return response.data.message;
      return "error";
    } catch (error) {
      console.log(error);
      return "error";
    }
  }
  const removeFromWatchLater = async (videoId: string): Promise<string> => {
    try {
      const response = await api.delete(`/video/watchlater/${videoId}`);
      if (response) return response.data.message;
      return "error";
    } catch (error) {
      console.log(error);
      return "error";
    }
  }

  const checkVideoInWatchLater = async (videoId: string): Promise<boolean> => {
    try {
      const response = await api.get(`/video/watchlater/${videoId}`);
      if (response) return response.data.data;
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const removeFromHistory = async (entityId: string): Promise<string> => {
    try {
      const response = await api.patch(`/video/history/${entityId}`);
      if (response) return response.data.message;
      return "error";
    } catch (error) {
      console.log(error);
      return "error";
    }
  }

  const checkVideo = async(key: string): Promise<boolean> => {
    try {
      const getPathFromUrl = (url: string): string => {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.startsWith("/")
          ? parsedUrl.pathname.slice(1) 
          : parsedUrl.pathname;
      };
      const path = getPathFromUrl(key);
    const response = await api.get(`/image/check?key=${path}`)
    if (response) return response.data.result
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }


  return (
    <VideoContext.Provider
      value={{
        videos,
        setVideos,
        addVideo,
        uploadFiles,
        getSignedUrls,
        getVideos,
        getVideoFiles,
        getVideoById,
        getJoinedGuildVideos,
        getLikedVideos,
        searchVideos,
        addView,
        addToWatchLater,
        removeFromWatchLater,
        checkVideoInWatchLater,
        removeFromHistory,
        checkVideo
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export default VideoProvider;
