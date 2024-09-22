import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import {
  LoginTemplate,
  UserDetails,
} from "../templates/user_template";
import { GetGuilds } from "../templates/guild_template";

interface CheckMember {
  isMember: boolean;
}

interface UserContextType {
  user: UserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  login: (userInfo: LoginTemplate) => Promise<{ success: boolean; error?: string }>;
  register: (userInfo: FormData) => Promise<boolean>;
  logout: () => Promise<boolean>;
  joinGuild: (guildId: string) => Promise<string>;
  leaveGuild: (guildId: string) => Promise<string>;
  checkMembership: (guildId: string) => Promise<boolean>;
  getUserGuilds: () => Promise<GetGuilds[] | null>;
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
  const navigate = useNavigate();

  // Load user from cookie when the component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const storedUser: AxiosResponse<UserDetails> = await axios.get('/users/protected/current-user',{withCredentials: true})
        if (storedUser) {
          setUser(storedUser.data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    }
    getCurrentUser()
  }, [navigate]);

  const login = async (userInfo: LoginTemplate): Promise<{ success: boolean; error?: string }> => {
    try {
      const response: AxiosResponse<UserDetails> = await axios.post(
        "/users/login",
        userInfo,
        { withCredentials: true }
      );
      setUser(response.data);


      return { success: true }; // Login successful
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        return { success: false, error: error.response.data || "Login failed" };
      } else if (error.request) {
        return { success: false, error: "No response from server. Please try again later." };
      } else {
        return { success: false, error: error.message || "An error occurred during login." };
      }
    }
  };

  const register = async (formData: FormData): Promise<boolean> => {
    try {
      const email = formData.get("email")
      const password = formData.get("password")
      if (typeof email !== "string" || typeof password !== "string") {
        throw new Error("Invalid email or password");
      }
      const userInfo: LoginTemplate = {
        email, password
      }
      const response: AxiosResponse<AddUserResponse> = await axios.post(
        "/users/addUser",
        formData,
        { withCredentials: true }
      );
      console.log(response);
      login(userInfo)
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    
    try {
      const response: AxiosResponse<string> = await axios.post("/users/protected/logout", {}, { withCredentials: true });
      console.log(response);

      setUser(null);


      return true;
    } catch (error) {
      return false;
    }
  };

  const joinGuild = async (guildId: string): Promise<string> => {
    try {
      const userId = user?.id;
      const response: AxiosResponse<string> = await axios.post(
        "/users/protected/join-guild",
        { userId, guildId },
        { withCredentials: true }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
        return error.response?.data;
      } else {
        console.error("Unexpected error:", error);
        return "An unexpected error occurred";
      }
    }
  };

  const leaveGuild = async (guildId: string): Promise<string> => {
    try {
      const userId = user?.id;
      const response: AxiosResponse<string> = await axios.post(
        "/users/protected/leave-guild",
        { userId, guildId },
        { withCredentials: true }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
        return error.response?.data;
      } else {
        console.error("Unexpected error:", error);
        return "An unexpected error occurred";
      }
    }
  };

  const checkMembership = async (guildId: string): Promise<boolean> => {
    const userId = user?.id;
    try {
      const response: AxiosResponse<CheckMember> = await axios.post("/members/check", { userId, guildId }, { withCredentials: true });
      console.log(response);
      return response.data.isMember;
    } catch (error) {
      return false;
    }
  };

  const getUserGuilds = async (): Promise<GetGuilds[] | null> => {
    try {
      const response: AxiosResponse<GetGuilds[]> = await axios.get(`/users/guilds/${user?.id}`, { withCredentials: true });
      console.log(response);
      return response.data;
    } catch (error) {
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, login, register, logout, joinGuild, leaveGuild, checkMembership, getUserGuilds }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
