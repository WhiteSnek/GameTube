import React from 'react';
import { SidebarItems } from '../../templates/sidebar_template';
import { Home, Subscriptions, History, ThumbUp, Castle } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { useUser } from '../../providers/UserProvider';

const Sidebar: React.FC = () => {
    const {user} = useUser()
    const guildId = user?.guild ? user.guild : "$";
    const list_items: SidebarItems[] = [
        { name: "Home", icon: Home, link: "/" },
        { name: "Subscriptions", icon: Subscriptions, link: "/subscriptions"},
        { name: "Your Guild", icon: Castle, link: `/guilds/${guildId}`},
        { name: "History", icon: History, link: "/history" },
        { name: "Liked Videos", icon: ThumbUp, link: "/liked-videos" }
    ];

    return (
        <div className='h-full p-4'>
            {list_items.map((item, index) => (
                <NavLink 
                    key={index}
                    to={item.link}
                    className={({ isActive }) => 
                        `flex items-center gap-3 p-2 my-1 text-white ${isActive ? 'bg-red-500' : ''}  hover:bg-red-500 hover:text-white transition-all rounded-md`
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
