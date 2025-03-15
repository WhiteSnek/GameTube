'use client'
import React from 'react';

interface TagListProps {
    tags: string[];
    activeTag: string;
    setActiveTag: React.Dispatch<React.SetStateAction<string>>;
}

const TagList: React.FC<TagListProps> = ({ tags, activeTag, setActiveTag }) => {
    return (
        <div className="flex gap-4 items-center overflow-x-auto p-1 sm:p-4 fixed z-40 top-[4rem] transition-all bg-white dark:bg-zinc-950 border-b border-gray-700 scrollbar-hide w-[calc(100vw-240px)]">
            {
                tags.map((tag, index) => (
                    <button 
                        onClick={() => setActiveTag(tag.toLowerCase())} 
                        key={index} 
                        className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors duration-200 
                        ${activeTag === tag.toLowerCase() ? 'bg-red-400 text-white' : 'bg-red-900 text-white hover:bg-red-700'}`}
                    >
                        {tag}
                    </button>
                ))
            }
        </div>
    );
};

export default TagList;
