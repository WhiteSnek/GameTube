import React, { useEffect, useState } from 'react';
import { useSidebar } from '../../providers/SidebarProvider';

const TagList: React.FC = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [activeTag,setActiveTag] = useState<string>('all');
    const {showSidebar} = useSidebar()
    const dummy: string[] = [
        "All",
        "Action",
        "Adventure",
        "RPG",
        "Shooter",
        "Strategy",
        "Puzzle",
        "Simulation",
        "Multiplayer",
        "Open World",
        "Fantasy",
        "Sci-Fi",
        "Survival",
        "Horror",
        "Platformer",
        "Racing",
        "Sports",
        "Casual",
        "Battle Royale",
        "MMORPG",
        "Co-op",
        "Indie",
        "Retro",
        "VR",
        "Stealth",
        "Fighting",
        "Sandbox",
        "Zombie",
        "Historical",
        "Adventure RPG",
        "Story-Driven",
        "The Legend of Zelda: Breath of the Wild",
        "Minecraft",
        "Among Us",
        "Fortnite",
        "Call of Duty: Warzone",
        "The Witcher 3: Wild Hunt",
        "Red Dead Redemption 2",
        "Overwatch",
        "PUBG",
        "Grand Theft Auto V",
        "Apex Legends",
        "Cyberpunk 2077",
        "Hades",
        "Stardew Valley",
        "Fall Guys",
        "Valorant",
        "Assassin's Creed Valhalla",
        "Dark Souls III",
        "Horizon Zero Dawn",
        "Genshin Impact",
        "Animal Crossing: New Horizons"
    ];

    useEffect(() => {
        setTags(dummy);
    }, []);

    return (
        <div className={`flex gap-4 items-center overflow-x-auto p-4 fixed top-[4rem] ${showSidebar ? 'left-[16.67%] w-[calc(100%-16.67%)]' : 'w-full' } transition-all  bg-zinc-900 border-b border-gray-700 z-20`}>
            {tags.map((tag, index) => (
                <button onClick={()=>setActiveTag(tag.toLowerCase())} key={index} className={`${activeTag === tag.toLowerCase() ? 'bg-red-400': 'bg-red-900 text-white'} text-sm font-semibold px-4 py-2 rounded-md whitespace-nowrap`}>
                    {tag}
                </button>
            ))}
        </div>
    );
};

export default TagList;
