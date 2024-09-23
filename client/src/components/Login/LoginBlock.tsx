import React, { useState } from "react";
import { LoginTemplate } from "../../templates/user_template";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../providers/UserProvider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const LoginBlock: React.FC = () => {
  const { login } = useUser();
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const [userInfo, setUserInfo] = useState<LoginTemplate>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (userInfo.email === "" && userInfo.password === "") {
      setSnackbarMessage("Email and password are required!");
      setSeverity("error");
      setOpen(true);
    } else if (userInfo.password === "") {
      setSnackbarMessage("Password is required!");
      setSeverity("error");
      setOpen(true);
    } else if (userInfo.email === "") {
      setSnackbarMessage("Email is required!");
      setSeverity("error");
      setOpen(true);
    } else {
      try {
        const { success, error } = await login(userInfo);
        if (success) {
          setSnackbarMessage("User Logged In!!");
          setSeverity("success");
          setOpen(true);
          navigate("/");
        } else {
          setSnackbarMessage(error || "Login failed. Please try again.");
          setSeverity("error");
          setOpen(true);
        }
      } catch (error) {
        setSnackbarMessage("An error occurred during login.");
        setSeverity("error");
        setOpen(true);
      }
    }
  };

  return (
    <div className="flex justify-center items-center mt-36 bg-zinc-900 sm:max-w-xl max-w-xs mx-auto">
      <form
        className="bg-zinc-800 p-8 rounded-lg border border-red-500 w-full max-w-xl"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl text-red-500 mb-6 font-bold text-center">
          Login
        </h1>
        <div className="mb-6">
          <label className="block text-white mb-2">Email Address:</label>
          <input
            type="email"
            value={userInfo?.email}
            onChange={(e) =>
              setUserInfo({ ...userInfo, email: e.target.value })
            }
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
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Login
        </button>

        <div className="flex flex-col gap-2 py-3 text-sm text-white">
          <Link to="/" className="hover:text-gray-400">
            Forgot password?
          </Link>
          <Link to="/register" className="hover:text-gray-400">
            Don't have an account? Sign up
          </Link>
        </div>
      </form>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginBlock;
