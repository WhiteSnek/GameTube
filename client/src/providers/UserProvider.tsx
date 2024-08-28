import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  LoginTemplate,
  UserDetails,
} from "../templates/user_template";
import axios, { AxiosResponse } from "axios";

interface UserContextType {
  user: UserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  login: (userInfo: LoginTemplate) => Promise<boolean>;
  register: (userInfo: FormData) => Promise<boolean>;
  logout: () => Promise<boolean>;
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
        const response: AxiosResponse<string> = await axios.post('/protected/logout',{},{withCredentials: true});
        console.log(response)
        setUser(null)
        return true;
    } catch (error) {
        return false;
    }
  }

  

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
