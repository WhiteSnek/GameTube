import React, { createContext, ReactNode, useContext, useState } from 'react';
import { GuildDetails } from '../templates/guild_template';
import axios, { AxiosResponse } from 'axios';

interface GuildContextType {
  guild: GuildDetails | null;
  setGuild: React.Dispatch<React.SetStateAction<GuildDetails | null>>;
  createGuild: ({formData, userId}: CreateGuildProps) => Promise<boolean>;
  getGuildInfo: (guildId: string) => Promise<boolean>;
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
        `/protected/create-guild/${userId}`,
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
        `/protected/guilds/${guildId}`,
        { withCredentials: true }
      );
      setGuild(response.data);

      return true;
    } catch (error) {
      console.error("Failed to fetch guild:", error);
      return false;
    }
  }

  return (
    <GuildContext.Provider value={{ guild, setGuild, createGuild, getGuildInfo }}>
      {children}
    </GuildContext.Provider>
  );
};

export default GuildProvider;
