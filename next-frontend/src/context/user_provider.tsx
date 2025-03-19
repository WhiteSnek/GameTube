"use client";
import { SignUpUser, UserType } from "@/types/user.types";
import React, { createContext, ReactNode, useContext, useState } from "react";
import axios from "axios";
interface UserContextType {
  User: UserType | undefined;
  setUser: React.Dispatch<React.SetStateAction<UserType | undefined>>;
  signup: (data: SignUpUser) => Promise<void>;
  getSignedUrls: (
    avatar: string,
    coverImage: string
  ) => Promise<{ avatarUrl: string; coverUrl: string }>;
  uploadImages: (
    avatarUrl: string,
    coverUrl: string,
    avatar: File,
    coverImage: File
  ) => Promise<any>;
  signin: (email: string, password: string) => Promise<void>;
  getUserImages: (userId: string) => Promise<void>;
  images: { avatarUrl: string; coverUrl: string };
  setImages: React.Dispatch<
    React.SetStateAction<{ avatarUrl: string; coverUrl: string }>
  >;
  logout: () => Promise<void>
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
  const [User, setUser] = useState<UserType | undefined>(undefined);
  const [images, setImages] = useState<{ avatarUrl: string; coverUrl: string }>(
    {
      avatarUrl: "",
      coverUrl: "",
    }
  );
  const getSignedUrls = async (avatar: string, coverImage: string) => {
    const response = await axios.get(
      `http://localhost:8000/auth/upload-url?avatar=${avatar}&coverImage=${coverImage}`
    );
    const { avatarUrl, coverUrl } = response.data;
    return { avatarUrl, coverUrl };
  };

  const getUserImages = async (userId: string) => {
    const response = await axios.get(
      `http://localhost:8000/auth/images/${userId}`
    );
    setImages(response.data);
    console.log(response.data);
  };

  const signup = async (data: SignUpUser) => {
    const response = await axios.post(
      "http://localhost:8000/auth/signup",
      data
    );
    if (response.data.error) {
      console.log(response.data.error);
    } else {
      console.log(response.data.data);
    }
  };

  const signin = async (email: string, password: string) => {
    const response = await axios.post("http://localhost:8000/auth/signin", {
      email,
      password,
    });
    if (response.data.error) {
      console.log(response.data.error);
    } else {
      setUser(response.data.data);
    }
  };

  const logout = async() => {
    const response = await axios.post("http://localhost:8000/auth/logout", {}, {withCredentials: true})
    console.log(response)
    setUser(undefined)
  }

  const uploadImages = async (
    avatarUrl: string,
    coverUrl: string,
    avatarFile: File,
    coverFile: File
  ) => {
    try {
      // Upload Avatar
      await axios.put(avatarUrl, avatarFile, {
        headers: {
          "Content-Type": avatarFile.type,
        },
      });
      console.log("Avatar uploaded successfully");
      // Upload Cover Image
      await axios.put(coverUrl, coverFile, {
        headers: {
          "Content-Type": coverFile.type,
        },
      });
      console.log("Cover image uploaded successfully");
      return { success: true };
    } catch (error) {
      console.error("Error uploading images:", error);
      return { success: false, error };
    }
  };
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
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
