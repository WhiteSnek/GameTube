"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Castle, History, List, ThumbsUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", icon: Home, link: "/" },
    { name: "Subscriptions", icon: List, link: "/subscriptions" },
    { name: "Your Guild", icon: Castle, link: `/guilds/1` },
    { name: "History", icon: History, link: "/history" },
    { name: "Liked Videos", icon: ThumbsUp, link: "/liked-videos" },
    { name: "Watch Later", icon: Clock, link: "/watch-later" },
  ];

  return (
    <aside className="h-screen w-64 bg-zinc-100 dark:bg-zinc-900 text-red-500 dark:text-white p-4 fixed left-0 top-16 flex flex-col gap-4 z-50 shadow-md">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all",
              pathname === item.link ? "bg-zinc-200 dark:bg-zinc-700" : "hover:bg-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;