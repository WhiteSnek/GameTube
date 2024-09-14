import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  LoginTemplate,
  UserDetails,
} from "../templates/user_template";
import { GetGuilds } from "../templates/guild_template";
import axios, { AxiosResponse } from "axios";

interface CheckMember {
  isMember: boolean
}



interface UserContextType {
  user: UserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  login: (userInfo: LoginTemplate) => Promise<boolean>;
  register: (userInfo: FormData) => Promise<boolean>;
  logout: () => Promise<boolean>;
  joinGuild: (guildId: string) => Promise<string>
  leaveGuild: (guildId: string) => Promise<string>
  checkMembership: (guildId: string) => Promise<boolean>
  getUserGuilds: () => Promise<GetGuilds[] | null>
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

interface AddUserResponse {
  id: string;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDetails | null>(null);

  const login = async (userInfo: LoginTemplate): Promise<boolean> => {
    try {
      const response: AxiosResponse<UserDetails> = await axios.post(
        "/users/login",
        userInfo,
        { withCredentials: true }
      );
      console.log(response);
      setUser(response.data);
      return true; // Login successful
    } catch (error) {
      console.log(error);
      return false; // Login failed
    }
  };

  const register = async (formData: FormData): Promise<boolean> => {
    try {
      const response: AxiosResponse<AddUserResponse> = await axios.post(
        "/users/addUser",
        formData,
        { withCredentials: true }
      );
      console.log(response);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
        const response: AxiosResponse<string> = await axios.post('/users/protected/logout',{},{withCredentials: true});
        console.log(response)
        setUser(null)
        return true;
    } catch (error) {
        return false;
    }
  }


  const joinGuild = async (guildId: string): Promise<string> => {
    try {
      const userId = user?.id;
      const response: AxiosResponse<string> = await axios.post(
        '/users/protected/join-guild',
        { userId, guildId },
        { withCredentials: true }
      );
      console.log(response);
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data); 
        return error.response?.data;
      } else {
        console.error('Unexpected error:', error); 
        return 'An unexpected error occurred'; 
      }
    }
  };
  
  const leaveGuild = async( guildId: string): Promise<string> => {
    try {
      const userId = user?.id
      const response: AxiosResponse<string> = await axios.post('/users/protected/leave-guild',{userId,guildId}, {withCredentials: true})
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data); 
        return error.response?.data;
      } else {
        console.error('Unexpected error:', error); 
        return 'An unexpected error occurred'; 
      }
    }
  }

  const checkMembership = async (guildId: string): Promise<boolean> => {
    const userId = user?.id
    try {
      const response: AxiosResponse<CheckMember> = await axios.post('/members/check',{userId,guildId}, {withCredentials: true});
      console.log(response);
      return response.data.isMember
    } catch (error) {
      return false;
    }
  }

  const getUserGuilds = async (): Promise<GetGuilds[] | null> => {
    try {
      const response: AxiosResponse<GetGuilds[]> = await axios.get(`/users/guilds/${user?.id}`, {withCredentials: true});
      console.log(response)
      return response.data
    } catch (error) {
      return null
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout, joinGuild, leaveGuild, checkMembership, getUserGuilds }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
