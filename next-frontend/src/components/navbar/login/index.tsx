"use client";

import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Signup from "../signup";
import { LoginImage } from "@/assets";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";
import { useUser } from "@/context/user_provider";

interface LoginProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Login:React.FC<LoginProps> = ({setOpen}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {signin} = useUser()
  const handleLogin =async() => {
    await signin(email, password)
    setOpen(false)
  };

  const handleGoogleLogin = () => {
    console.log("Signing in with Google");
    // Add Google login logic here
  };

  const handleDiscordLogin = () => {
    console.log("Signing in with Discord");
    // Add Discord login logic here
  };

  return (
    <DialogContent className="p-6 sm:max-w-3xl sm:min-h-[600px] bg-zinc-200 dark:bg-zinc-900">
      <div className="flex flex-col sm:flex-row items-center">
        {/* Left Side - Image */}
        <div className="hidden sm:flex sm:w-1/2 p-4 rounded-l-lg">
          <img
            src={LoginImage.src}
            alt="Login Illustration"
            className="w-full h-auto rounded-md object-cover"
          />
        </div>

        <div className="hidden sm:block w-px bg-zinc-800 h-full"></div>

        {/* Right Side - Login Form */}
        <div className="w-full sm:w-1/2 p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Login
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-1 relative">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              className="w-full bg-red-500 text-white flex justify-center items-center hover:bg-red-700 cursor-pointer"
              onClick={handleLogin}
            >
              <LogIn size={20} /> Login
            </Button>
            <hr className="border-t border-zinc-500" />
            <div className="flex flex-col space-y-2 mt-4">
              <Button
                onClick={handleGoogleLogin}
                className="w-full flex cursor-pointer items-center justify-center gap-2 bg-white border border-gray-300 text-black hover:bg-gray-100"
              >
                <FcGoogle size={20} /> Sign in with Google
              </Button>
              <Button
                onClick={handleDiscordLogin}
                className="w-full flex cursor-pointer items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-800"
              >
                <FaDiscord size={20} /> Sign in with Discord
              </Button>
            </div>

            <div className="text-sm text-gray-400 flex flex-col gap-4 mt-4">
              <a href="#" className="text-blue-500 hover:underline">
                Forgot Password?
              </a>
              <Signup />
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default Login;
