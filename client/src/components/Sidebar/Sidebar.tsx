import React from 'react';
import { SidebarItems } from '../../templates/sidebar_template';
import { Home, Subscriptions, History, PlaylistPlay, WatchLater, ThumbUp, Castle } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { useUser } from '../../providers/UserProvider';

const Sidebar: React.FC = () => {
    const {user} = useUser()
    const list_items: SidebarItems[] = [
        { name: "Home", icon: Home, link: "/" },
        { name: "Subscriptions", icon: Subscriptions, link: user ? "/subscriptions" : '/login' },
        { name: "Your Guild", icon: Castle, link: user ? `/guilds/${user?.guild}` : '/login' },
        { name: "History", icon: History, link: "/history" },
        { name: "Playlists", icon: PlaylistPlay, link: "/playlists" },
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
                        `flex items-center gap-3 p-2 text-white ${isActive ? 'bg-red-500' : ''}  hover:bg-red-500 hover:text-white transition-all rounded-md`
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
