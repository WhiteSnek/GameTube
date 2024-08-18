import React from 'react';
import { SidebarItems } from '../../templates/sidebar_template';
import { Home, Subscriptions, History, PlaylistPlay, WatchLater, ThumbUp } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { IconButton } from '@mui/material';

const Sidebar: React.FC = () => {
    const list_items: SidebarItems[] = [
        { name: "Home", icon: Home, link: "/" },
        { name: "Subscriptions", icon: Subscriptions, link: "/subscriptions" },
        { name: "Your Channel", icon: Home, link: "/channel" },
        { name: "History", icon: History, link: "/history" },
        { name: "Playlist", icon: PlaylistPlay, link: "/playlist" },
        { name: "Watch Later", icon: WatchLater, link: "/watch-later" },
        { name: "Liked Videos", icon: ThumbUp, link: "/liked-videos" }
    ];

    return (
        <div className='h-full p-4'>
            {list_items.map((item, index) => (
                <NavLink 
                    key={index}
                    to={item.link}
                    className={({ isActive }) => 
                        `flex items-center gap-3 p-2 text-white ${isActive ? 'bg-red-500' : ''}  hover:bg-red-500 hover:text-zinc-900 rounded-md`
                    }
                    aria-label={item.name}
                >
                    <IconButton
                        sx={{
                            color: 'inherit',
                            '&:hover': {
                                color: 'red.main',
                            },
                        }}
                    >
                        <item.icon />
                    </IconButton>
                    <span>{item.name}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default Sidebar;
