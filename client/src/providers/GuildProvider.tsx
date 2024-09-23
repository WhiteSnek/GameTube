import React, { createContext, ReactNode, useContext, useState } from 'react';
import { AllGuilds, GuildDetails, GuildMembers } from '../templates/guild_template';
import axios, { AxiosResponse } from 'axios';

interface EditMembership {
  userId: string;
  memberId: string;
}

interface GuildContextType {
  guild: GuildDetails | null;
  setGuild: React.Dispatch<React.SetStateAction<GuildDetails | null>>;
  createGuild: ({formData, userId}: CreateGuildProps) => Promise<boolean>;
  getGuildInfo: (guildId: string) => Promise<boolean>;
  getGuildMembers: (guildId: string) => Promise<GuildMembers[] | null>;
  promoteUser: (details: EditMembership) => Promise<boolean>;
  demoteUser: (details: EditMembership) => Promise<boolean>;
  kickUser: (details: EditMembership) => Promise<boolean>;
  searchGuild: (query: string) => Promise<AllGuilds[] | null>;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export const useGuild = (): GuildContextType => {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error("useGuild must be used within a GuildProvider");
  }
  return context;
};

interface GuildProviderProps {
  children: ReactNode;
}

interface CreateGuildProps {
  formData: FormData;
  userId: string | undefined;
}

const GuildProvider: React.FC<GuildProviderProps> = ({ children }) => {
  const [guild, setGuild] = useState<GuildDetails | null>(null);

  const createGuild = async ({ formData, userId }: CreateGuildProps): Promise<boolean> => {
    try {
      const response: AxiosResponse<GuildDetails> = await axios.post(
        `/guilds/protected/create-guild/${userId}`,
        formData,
        { withCredentials: true }
      );
      console.log(response);
      
      // Optionally update the guild in context here
      setGuild(response.data);

      return true; // Return true on success
    } catch (error) {
      console.error("Failed to create guild:", error);
      return false; // Return false on failure
    }
  };


  const getGuildInfo = async(guildId: string): Promise<boolean> => {
    try {
      const response: AxiosResponse<GuildDetails> = await axios.get(
        `/guilds/${guildId}`,
        { withCredentials: true }
      );
      setGuild(response.data);

      return true;
    } catch (error) {
      console.error("Failed to fetch guild:", error);
      setGuild(null)
      return false;
    }
  }

  

  const getGuildMembers = async (guildId: string): Promise<GuildMembers[] | null> => {
    try {
      const response: AxiosResponse<GuildMembers[]> = await axios.get(`/guilds/members/${guildId}`, {withCredentials: true});
      return response.data;
    } catch (error) {
      return null
    }
  }

  const searchGuild = async (query: string): Promise<AllGuilds[] | null> => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response: AxiosResponse<AllGuilds[]> = await axios.get(`/guilds?query=${encodedQuery}`, {withCredentials: true});
      return response.data;
    } catch (error) {
      return null
    }
  }

  

  const promoteUser = async (userDetails: EditMembership): Promise<boolean> => {
    try {
      const details = {
        userId: userDetails.userId,
        guildId: guild?.id,
        memberId: userDetails.memberId
      }
      const response: AxiosResponse<string> = await axios.post('/members/protected/promote', details, {withCredentials: true})
      console.log(response.data)
      return true;
    } catch (error) {
      console.log('Something went wrong!!')
      return false;
    }
  }

  const demoteUser = async (userDetails: EditMembership): Promise<boolean> => {
    try {
      const details = {
        userId: userDetails.userId,
        guildId: guild?.id,
        memberId: userDetails.memberId
      }
      const response: AxiosResponse<string> = await axios.post('/members/protected/demote', details, {withCredentials: true})
      console.log(response.data)
      return true;
    } catch (error) {
      console.log('Something went wrong!!')
      return false;
    }
  }

  const kickUser = async (userDetails: EditMembership): Promise<boolean> => {
    try {
      const details = {
        userId: userDetails.userId,
        guildId: guild?.id,
        memberId: userDetails.memberId
      }
      const response: AxiosResponse<string> = await axios.post('/members/protected/kick', details, {withCredentials: true})
      console.log(response.data)
      return true;
    } catch (error) {
      console.log('Something went wrong!!')
      return false;
    }
  }


  return (
    <GuildContext.Provider value={{ guild, setGuild, createGuild, getGuildInfo, getGuildMembers, promoteUser,demoteUser,kickUser, searchGuild }}>
      {children}
    </GuildContext.Provider>
  );
};

export default GuildProvider;
