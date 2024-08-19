import React, { useState } from "react";
import { RegisterTemplate } from "../../templates/user_template";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface RegisterProps {
  userInfo: RegisterTemplate;
  setUserInfo: React.Dispatch<React.SetStateAction<RegisterTemplate>>;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const Page1: React.FC<RegisterProps> = ({
  userInfo,
  setUserInfo,
  setActiveTab,
}) => {
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const togglePasswordVisibility = (
    e: React.FormEvent<HTMLButtonElement>,
    field: "password" | "confirmPassword"
  ) => {
    e.preventDefault();
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInfo.password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setActiveTab((prev) => prev + 1);
    console.log(userInfo);
  };

  return (
    <form className="p-4 border-b-2  border-x-2 border-red-400 rounded-b-md" onSubmit={handleNext}>
      <div className="mb-6">
        <label className="block text-white mb-2">Username:</label>
        <input
          type="text"
          value={userInfo.username}
          onChange={(e) =>
            setUserInfo({ ...userInfo, username: e.target.value })
          }
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">Email:</label>
        <input
          type="email"
          value={userInfo.email}
          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-6 relative">
        <label className="block text-white mb-2">Password:</label>
        <input
          type={showPassword ? "text" : "password"}
          value={userInfo.password}
          onChange={(e) =>
            setUserInfo({ ...userInfo, password: e.target.value })
          }
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          className="absolute top-8 right-0 bg-white py-2.5 px-4 rounded-r-md"
          onClick={(e) => togglePasswordVisibility(e, "password")}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </button>
      </div>

      <div className="mb-6 relative">
        <label className="block text-white mb-2">Confirm Password:</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          className="absolute top-8 right-0 bg-white py-2.5 px-4 rounded-r-md"
          onClick={(e) => togglePasswordVisibility(e, "confirmPassword")}
        >
          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        NEXT
      </button>
    </form>
  );
};

export default Page1;
