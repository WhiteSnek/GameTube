"use client";
import { SignUpUser, UserType } from "@/types/user.types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/axios";
import axios from "axios";
import { HistoryType, VideoType } from "@/types/video.types";

interface UserContextType {
  User: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  signup: (data: SignUpUser) => Promise<void>;
  getSignedUrls: (
    avatar: string,
  ) => Promise<{ avatarUrl: string}>;
  uploadImages: (
    avatarUrl: string,
    avatar: File,
  ) => Promise<any>;
  signin: (email: string, password: string) => Promise<void>;
  getUserImages: (userId: string) => Promise<void>;
  images: { avatarUrl: string; };
  setImages: React.Dispatch<
    React.SetStateAction<{ avatarUrl: string;}>
  >;
  logout: () => Promise<void>;
  getMultipleUserAvatars: (avatarKeys: string[]) => Promise<string[] | null>;
  addLike: (entityId: string, entityType: "video"|"comment"|"reply") => Promise<string>;
  removeLike: (entityId: string, entityType: "video"|"comment"|"reply") => Promise<string>;
  getLike: (entityId: string, entityType: "video"|"comment"|"reply") => Promise<boolean>;
  getHistory: () => Promise<HistoryType>;
  getWatchLater: () => Promise<VideoType[]>;
  clearHistory: () => Promise<string>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [User, setUser] = useState<UserType | null>(null);
  const [images, setImages] = useState<{ avatarUrl: string}>(
    {
      avatarUrl: "",
    }
  );
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await api.get("/user/", { withCredentials: true });
        if (response.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Token expired or invalid:", error);
      }
    };
    getCurrentUser();
  }, []);

  const getSignedUrls = async (avatar: string) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/image/upload-url?avatar=${avatar}`
    );
    const { avatarUrl } = response.data;
    return { avatarUrl };
  };

  const getUserImages = async (userId: string) => {
    const response = await api.get(`/image/user/${userId}`);
    setImages(response.data);
    console.log(response.data);
  };

  const signup = async (data: SignUpUser) => {
    const response = await api.post("/auth/signup", data);
    if (response.data.error) {
      console.log(response.data.error);
    } else {
      console.log(response.data.data);
    }
  };


  const signin = async (email: string, password: string) => {
    const response = await api.post(
      "/auth/signin",
      {
        email,
        password,
      },
      { withCredentials: true }
    );
    if (response.data.error) {
      console.log(response.data.error);
    } else {
      setUser(response.data.data);
      window.location.reload();
    }
  };

  const logout = async () => {
    const response = await api.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    console.log(response);
    setUser(null);
    window.location.reload();
  };

  const uploadImages = async (
    avatarUrl: string,
    avatarFile: File,
  ) => {
    try {
      // Upload Avatar
      await axios.put(avatarUrl, avatarFile, {
        headers: {
          "Content-Type": avatarFile.type,
        },
      });
      console.log("Avatar uploaded successfully");
      return { success: true };
    } catch (error) {
      console.error("Error uploading images:", error);
      return { success: false, error };
    }
  };

  const getMultipleUserAvatars = async (
    avatarKeys: string[]
  ): Promise<string[] | null> => {
    console.log(avatarKeys)
    try {
      const response = await api.post(
        "/image/users",
        { avatarKeys },
      );
      return response.data.avatarUrls;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const addLike = async(entityId: string, entityType: "video"|"comment"|"reply"): Promise<string> => {
    try {
      const response = await api.patch(`/like/${entityType}/${entityId}`)
      return response.data.message
    } catch (error) {
      console.log(error)
      return "error"
    }
  }

  const removeLike = async(entityId: string, entityType: "video"|"comment"|"reply"): Promise<string> => {
    try {
      const response = await api.delete(`/like/${entityType}/${entityId}`)
      return response.data.message
    } catch (error) {
      console.log(error)
      return "error"
    }
  }
  const getLike = async(entityId: string, entityType: "video"|"comment"|"reply"): Promise<boolean> => {
    try {
      const response = await api.get(`/like/${entityType}/${entityId}`)
      return response.data.liked
    } catch (error) {
      console.log(error)
      return false
    }
  }

  const getHistory = async(): Promise<HistoryType> => {
    try {
      const response = await api.get('user/history')
      return response.data.data
    } catch (error) {
      return {}
    }
  }

  const getWatchLater = async(): Promise<VideoType[]> => {
    try {
      const response = await api.get('user/watchlater')
      return response.data.data
    } catch (error) {
      return []
    }
  }

  const clearHistory = async(): Promise<string> => {
    try {
      const response = await api.delete('user/history')
      return response.data.message
    } catch (error) {
      return "error"
    }
  }

  return (
    <UserContext.Provider
      value={{
        User,
        setUser,
        signup,
        getSignedUrls,
        uploadImages,
        signin,
        getUserImages,
        images,
        setImages,
        logout,
        getMultipleUserAvatars,
        addLike,
        removeLike,
        getLike,
        getHistory,
        getWatchLater,
        clearHistory
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
