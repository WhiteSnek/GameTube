"use client";

import { Sun, Moon, LogIn, Search, LogOut } from "lucide-react";
import { DefaultAvatar } from "@/assets";
import { useTheme } from "@/context/theme_provider";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Login from "./login";
import { useUser } from "@/context/user_provider";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { User, images, getUserImages, logout } = useUser();
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("")
  const router = useRouter();
  useEffect(() => {
    if (User?.id && !images.avatarUrl) {
      getUserImages(User.id);
    }
  }, [User?.id]);

  const handleSubmit = (e : React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <nav className="flex fixed w-screen z-50 items-center justify-between px-4 py-2 shadow-md transition-all duration-300 bg-zinc-100 text-black dark:bg-zinc-900 dark:text-white">
      <span className="text-xl md:text-3xl font-extrabold text-red-500 silkscreen-bold tracking-wide">
        GameTube
      </span>

      <div className="flex items-center gap-4">
        <form className="relative w-full max-w-md" onSubmit={handleSubmit}>
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Search for games..."
            className="w-full px-12 py-2 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-400 transition-all bg-white text-black border border-zinc-300 dark:bg-zinc-800 dark:text-white"
          />
        </form>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 bg-zinc-200 text-black rounded-full hover:bg-zinc-300 transition-all shadow-md dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
        >
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        {User ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-14">
                <img
                  src={images?.avatarUrl || DefaultAvatar.src}
                  alt="User Avatar"
                  className="w-full aspect-square object-cover rounded-full cursor-pointer "
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 shadow-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <DropdownMenuLabel className="text-lg font-bold">{User.fullname}</DropdownMenuLabel>
              <DropdownMenuItem className="text-sm text-zinc-500">{User.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">Joined: {new Date(User.createdAt).toLocaleDateString()}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500 flex items-center gap-2 cursor-pointer">
                <LogOut size={16} /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="px-5 cursor-pointer py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-all flex items-center gap-2 shadow-md">
              <LogIn size={20} /> Login
            </DialogTrigger>
            <Login setOpen={setOpen} />
          </Dialog>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
