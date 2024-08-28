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
    const {user} = useUser()

    const toggleSidebar = () => {
        setShowSidebar(prev => !prev);
    };

    const toggleSearch = () => {
        setShowSearch(prev => !prev);
    };

    return (
        <div className={`fixed top-0 left-0 right-0 bg-zinc-950 z-20 w-full grid grid-cols-10 gap-4 xs:gap-8 justify-between items-center py-2 px-4 md:px-10 ${showSearch ? 'hidden' : 'block'}`}>
            <div className='flex items-center col-span-5 md:col-span-3 space-x-4'>
                <button onClick={toggleSidebar} className='text-red-400 hover:text-red-300'>
                    <MenuIcon />
                </button>
                <span className='text-lg md:text-4xl text-red-400 silkscreen-bold'>
                    GameTube
                </span>
            </div>

            <div className='col-span-10 md:col-span-5 mt-4 md:mt-0 flex items-center justify-center md:justify-start'>
                <button
                    className='md:hidden text-red-400 hover:text-red-300'
                    onClick={toggleSearch}
                >
                    <SearchIcon />
                </button>
                <div className='hidden md:block w-full'>
                    <Search />
                </div>
            </div>

            <div className='col-span-10 md:col-span-2 mt-4 md:mt-0 flex justify-end space-x-4'>
                {user ? <UserDP/> :<LoginButton />}
            </div>

            <div className={`fixed top-0 left-0 h-full bg-zinc-800 border-r mt-[4rem] border-zinc-700 z-30 transition-transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:w-2/12 md:block`}>
                <Sidebar />
            </div>

            {showSearch && (
                <div className="fixed inset-0 bg-zinc-950 z-40 flex justify-center items-center">
                    <Search />
                    <button 
                        className="absolute top-4 right-4 text-red-400 hover:text-red-300"
                        onClick={toggleSearch}
                    >
                        <span className="text-2xl">&times;</span> {/* Close button */}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;
