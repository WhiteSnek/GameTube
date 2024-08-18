import React from 'react';
import { Search, LoginButton } from './index';
import Sidebar from '../Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import { useSidebar } from '../../providers/SidebarProvider';

const Header: React.FC = () => {
    const {showSidebar, setShowSidebar} = useSidebar()
    const toggleSidebar = () => {
        setShowSidebar(prev => !prev);
    };

    return (
        <div className='fixed top-0 left-0 right-0 bg-zinc-950 z-20 w-full grid grid-cols-10 gap-4 xs:gap-8 justify-between items-center py-2 px-4 md:px-10'>
            <div className='flex items-center col-span-4 md:col-span-2 space-x-4'>
                <button onClick={toggleSidebar} className='text-red-400 hover:text-red-300'>
                    <MenuIcon />
                </button>
                <span className='text-lg md:text-4xl text-red-400 silkscreen-bold'>
                    GameTube
                </span>
            </div>
            <div className='col-span-10 md:col-span-6 mt-4 md:mt-0'>
                <Search />
            </div>
            <div className='col-span-10 md:col-span-2 mt-4 md:mt-0 flex justify-end space-x-4'>
                <LoginButton />
            </div>

            <div className={`fixed top-0 left-0 h-full bg-zinc-800 border-r mt-[4rem] border-zinc-700 z-30 transition-transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:w-2/12 md:block`}>
                <Sidebar />
            </div>
        </div>
    );
}

export default Header;
