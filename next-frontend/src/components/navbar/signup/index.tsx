"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { UploadCloud, ImagePlus } from "lucide-react";
import { SignupImage } from "@/assets";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";
const Signup = () => {
  const [step, setStep] = useState("account"); // Tracks tab state
  const [open, setOpen] = useState(false); // Controls dialog visibility
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    avatar: null as File | null,
    coverImage: null as File | null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleGoogleLogin = () => {
    console.log("Signing in with Google");
    // Add Google login logic here
  };

  const handleDiscordLogin = () => {
    console.log("Signing in with Discord");
    // Add Discord login logic here
  };
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "coverImage"
  ) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, [field]: e.target.files[0] });
    }
  };

  const handleSignup = () => {
    console.log("Signup details:", form);
    // Add signup logic here
    setOpen(false); // Close modal on successful signup
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className="text-blue-500 cursor-pointer hover:underline ">
          Don't have an account? Sign Up!
        </p>
      </DialogTrigger>

      <DialogContent className="p-6 sm:max-w-3xl sm:min-h-[600px] bg-zinc-200 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Left Side - Image */}
          <div className="hidden sm:flex sm:w-1/2 p-4 rounded-l-lg">
            <img
              src={SignupImage.src}
              alt="Signup Illustration"
              className="w-full h-auto rounded-md object-cover"
            />
          </div>

          <div className="hidden sm:block w-px bg-gray-800 h-full"></div>

          {/* Right Side - Login Form */}
          <div className="w-full sm:w-1/2 p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold ">
                Sign Up
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col space-y-2 mt-4">
              <Button
                onClick={handleGoogleLogin}
                className="w-full flex cursor-pointer items-center justify-center gap-2 bg-white border border-gray-300 text-black hover:bg-gray-100"
              >
                <FcGoogle size={20} /> Sign up with Google
              </Button>
              <Button
                onClick={handleDiscordLogin}
                className="w-full flex cursor-pointer items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-800"
              >
                <FaDiscord size={20} /> Sign up with Discord
              </Button>
            </div>
            <hr className="border-t border-zinc-500 my-4" />
            <Tabs
              value={step}
              onValueChange={setStep}
              className="w-full h-[350px]"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <Button className="w-full" onClick={() => setStep("profile")}>
                  Next
                </Button>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>

                <div className="flex flex-col space-y-1 relative">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
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

                <div className="flex flex-col space-y-1 relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("account")}>
                    Back
                  </Button>
                  <Button onClick={() => setStep("images")}>Next</Button>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-6">
                {/* Avatar Upload */}
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer hover:border-gray-600"
                  onClick={() =>
                    document.getElementById("avatarUpload")?.click()
                  }
                  onDragOver={(e) => e.preventDefault()} // Prevent default browser behavior
                  onDrop={(e) => {
                    e.preventDefault(); // Prevent image from opening
                    if (e.dataTransfer.files.length > 0) {
                      handleFileChange(
                        {
                          target: { files: e.dataTransfer.files },
                        } as React.ChangeEvent<HTMLInputElement>,
                        "avatar"
                      );
                    }
                  }}
                >
                  {form.avatar ? (
                    <img
                      src={URL.createObjectURL(form.avatar)}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <UploadCloud size={40} />
                      <p className="text-sm">Click or Drag to Upload Avatar</p>
                    </div>
                  )}
                  <Input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "avatar")}
                  />
                </div>

                {/* Cover Image Upload */}
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer hover:border-gray-600"
                  onClick={() =>
                    document.getElementById("coverImageUpload")?.click()
                  }
                  onDragOver={(e) => e.preventDefault()} // Prevent default behavior
                  onDrop={(e) => {
                    e.preventDefault(); // Prevent image from opening
                    if (e.dataTransfer.files.length > 0) {
                      handleFileChange(
                        {
                          target: { files: e.dataTransfer.files },
                        } as React.ChangeEvent<HTMLInputElement>,
                        "coverImage"
                      );
                    }
                  }}
                >
                  {form.coverImage ? (
                    <img
                      src={URL.createObjectURL(form.coverImage)}
                      alt="Cover Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <ImagePlus size={40} />
                      <p className="text-sm">
                        Click or Drag to Upload Cover Image
                      </p>
                    </div>
                  )}
                  <Input
                    id="coverImageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "coverImage")}
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("profile")}>
                    Back
                  </Button>
                  <Button onClick={handleSignup}>Sign Up</Button>
                </div>
              </TabsContent>
            </Tabs>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Signup;
