"use client";

import { Sun, Moon, LogIn, Search } from "lucide-react";
import { useTheme } from "@/context/theme_provider";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import Login from "./login";


const Navbar: React.FC = () => {
  const {theme, setTheme} = useTheme()

  return (
    <nav className="flex fixed w-screen z-50 items-center justify-between px-4 py-2 shadow-md transition-all duration-300 bg-zinc-100 text-black dark:bg-zinc-900 dark:text-white">
      <span className="text-xl md:text-3xl font-extrabold text-red-500 silkscreen-bold tracking-wide">
        GameTube
      </span>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search for games..."
            className="w-full px-12 py-2 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-400 transition-all bg-white text-black border border-zinc-300 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 bg-zinc-200 text-black rounded-full hover:bg-zinc-300 transition-all shadow-md dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
        >
          {theme === "dark"  ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <Dialog>
        <DialogTrigger className="px-5 cursor-pointer py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-all flex items-center gap-2 shadow-md">
          <LogIn size={20} /> Login
        </DialogTrigger>
          <Login />
        </Dialog>
      </div>
    </nav>
  );
};

export default Navbar;
