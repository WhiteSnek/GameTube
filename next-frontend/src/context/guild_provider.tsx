"use client";
import { CreateGuildType, GuildDetailsType, GuildMembersType, GuildsType, JoinedGuildType } from "@/types/guild.types";
import api from "@/lib/axios";
import React, { createContext, ReactNode, useContext,useState } from "react";
import axios from "axios";

interface SearchGuildsParams {
  query?: string;
  filter?: 'joined' | 'not_joined';
  tags?: string[];
  limit?: number;
  skip?: number;
}


interface GuildContextType {
  Guild: GuildDetailsType | undefined;
  setGuild: React.Dispatch<React.SetStateAction<GuildDetailsType | undefined>>;
  createGuild: (data: CreateGuildType) => Promise<void>;
  getSignedUrls: (
    avatar: string,
    coverImage: string
  ) => Promise<{ avatarUrl: string; coverUrl: string }>;
  getGuildImages: (userId: string) => Promise<void>;
  images: { avatarUrl: string; coverUrl: string };
  uploadImages: (
    avatarUrl: string,
    coverUrl: string,
    avatar: File,
    coverImage: File
  ) => Promise<any>;
  getGuild: (guildId?: string) => Promise<void>;
  searchGuilds: (params: SearchGuildsParams) => Promise<GuildsType[] | null>;
  getGuildAvatars: (guildIds: string[]) => Promise<string[] | null>;
  joinGuild: (guildId: string) => Promise<string | null>;
  leaveGuild: (guildId: string) => Promise<string | null>;
  getJoinedGuilds: () => Promise<JoinedGuildType[] | null>;
  getGuildMembers: (guildId: string) => Promise<GuildMembersType[]>;
  manageRoles: (guildId: string, memberId: string, action: "promote" | "demote" | "kick") => Promise<string>
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export const useGuild = () => {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error("useGuild must be used within a GuildProvider");
  }
  return context;
};

interface GuildProviderProps {
  children: ReactNode;
}

const GuildProvider: React.FC<GuildProviderProps> = ({ children }) => {
  const [Guild, setGuild] = useState<GuildDetailsType | undefined>(undefined);
  const [images, setImages] = useState<{ avatarUrl: string; coverUrl: string }>(
      {
        avatarUrl: "",
        coverUrl: "",
      }
    ); 
  const createGuild = async (data: CreateGuildType): Promise<void>  =>  {
    try {
      console.log(data)
        const response = await api.post("/guild/create",data,{withCredentials: true})
        if(response.data.data){
            setGuild(response.data.data)
        }
        if(response.data.error){
            throw response.data.error
        }
    } catch (error) {
        console.error(error)
    }
  }

  const getSignedUrls = async (avatar: string, coverImage: string) => {
    const response = await axios.get(
      `http://localhost:8000/image/guild/upload-url?avatar=${avatar}&coverImage=${coverImage}`
    );
    const { avatarUrl, coverUrl } = response.data;
    return { avatarUrl, coverUrl };
  };

  const getGuildImages = async (guildId: string) => {
    const response = await api.get(
      `/image/guild/${guildId}`
    );
    setImages(response.data);
    console.log(response.data);
  };

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

  const getGuild = async (guildId? :string): Promise<void> => {
    try {
        let response;
        if(guildId){
          response = await api.get(`/guild/${guildId}`,{withCredentials: true})
        }
        else{
          response = await api.get("/guild/",{withCredentials: true})
        }
        if (response.data.data){
            setGuild(response.data.data)
        }
        if(response.data.error){
          throw response.data.error
        }
    } catch (error) {
        console.log(error)
    }
  }

  const searchGuilds = async (params: SearchGuildsParams): Promise<GuildsType[] | null> => {
    try {
      const searchParams = new URLSearchParams();
  
      if (params.query) searchParams.append("search", params.query);
      if (params.filter) searchParams.append("filter", params.filter);
      if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());
      if (params.skip !== undefined) searchParams.append("skip", params.skip.toString());
  
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => searchParams.append("tags", tag));
      }
  
      const response = await api.get(`/guild/all?${searchParams.toString()}`, {
        withCredentials: true,
      });
  
      console.log(response.data?.data);
      return response.data?.data ?? null;
    } catch (error: any) {
      console.error("Error searching guilds:", error.response?.data || error.message);
      return null;
    }
  };  

  const getGuildAvatars = async(guildIds: string[]): Promise<string[] | null> => {
    try {
      const response = await api.post("/image/guilds", {guildIds}, {withCredentials: true})
      return response.data.avatarUrls
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const joinGuild = async (guildId: string): Promise<string | null> => {
    try {
      const response = await api.patch(`/guild/join/${guildId}`,{},{withCredentials: true})
      return response.data.message
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const leaveGuild = async (guildId: string): Promise<string | null> => {
    try {
      const response = await api.patch(`/guild/leave/${guildId}`,{},{withCredentials: true})
      return response.data.message
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const getJoinedGuilds = async(): Promise<JoinedGuildType[] | null> => {
    try {
      const response = await api.get('/guild/joined',{withCredentials: true})
      return response.data.data
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const getGuildMembers = async(guildId: string): Promise<GuildMembersType[]> => {
    try {
      const response = await api.get(`/guild/members/${guildId}`)
      if (response.data.data) return response.data.data
      return []
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const manageRoles = async(guildId: string, memberId: string, action: "promote" | "demote" | "kick"): Promise<string> => {
    try {
      const response = await api.patch(`/guild/members/${action}/${guildId}/${memberId}`)
      return response.data.message
    } catch (error) {
      console.log(error)
      return "error"
    }
  }


  return (
    <GuildContext.Provider value={{ Guild, setGuild, createGuild, getSignedUrls, getGuildImages, images, uploadImages, getGuild, searchGuilds, getGuildAvatars, joinGuild, leaveGuild,getJoinedGuilds,getGuildMembers,manageRoles }}>
      {children}
    </GuildContext.Provider>
  );
};

export default GuildProvider;
