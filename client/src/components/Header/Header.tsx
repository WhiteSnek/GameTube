import React, { useState } from 'react';
import { Search, LoginButton, UserDP } from './index';
import Sidebar from '../Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useSidebar } from '../../providers/SidebarProvider';
import { useUser } from '../../providers/UserProvider';

const Header: React.FC = () => {
    const { showSidebar, setShowSidebar } = useSidebar();
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const { user } = useUser();

    const toggleSidebar = () => {
        setShowSidebar(prev => !prev);
    };

    const toggleSearch = () => {
        setShowSearch(prev => !prev);
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-zinc-950 z-20 w-full flex items-center justify-between py-2 px-4 md:px-10">
            {/* Left Section: Logo & Menu */}
            <div className="flex items-center space-x-4">
                {/* Sidebar Toggle for Small Screens */}
                <button onClick={toggleSidebar} className="text-red-400 hover:text-red-300">
                    <MenuIcon />
                </button>
                <span className="text-lg md:text-4xl text-red-400 silkscreen-bold">
                    GameTube
                </span>
            </div>

            {/* Middle Section: Search Bar or Icon */}
            <div className="flex items-center justify-center flex-grow md:mx-10 lg:mx-20">
                {/* Search Icon for Small Screens */}
                <button className="md:hidden text-red-400 hover:text-red-300" onClick={toggleSearch}>
                    <SearchIcon />
                </button>

                {/* Full Search Bar for Medium and Larger Screens */}
                <div className="hidden md:block w-full">
                    <Search />
                </div>
            </div>

            {/* Right Section: User Avatar or Login Button */}
            <div className="flex items-center space-x-4">
                {user ? <UserDP /> : <LoginButton />}
            </div>

            {/* Sidebar: Slides in/out on Small Screens */}
            <div className={`fixed top-0 left-0 h-full bg-zinc-800 border-r mt-[4rem] border-zinc-700 z-30 transition-transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:w-2/12 md:block`}>
                <Sidebar />
            </div>

            {/* Header Search Overlay for Small Screens */}
            {showSearch && (
                <div className="fixed top-0 left-0 right-0 h-[4rem] bg-zinc-950 z-40 flex justify-center items-center">
                    <Search toggleSearch={toggleSearch} />
                    {/* Close Button for Header Search */}
                </div>
            )}
        </div>
    );
};

export default Header;
