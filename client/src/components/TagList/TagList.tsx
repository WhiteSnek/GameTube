import React, { useEffect, useState } from 'react';
import { useSidebar } from '../../providers/SidebarProvider';
import { useVideo } from '../../providers/VideoProvider';
import LoadingState from './LoadingState';

interface TagListProps {
    activeTag: string;
    setActiveTag: React.Dispatch<React.SetStateAction<string>>;
}

const TagList: React.FC<TagListProps> = ({ activeTag, setActiveTag }) => {
    const [tags, setTags] = useState<string[]>(['All']);
    const [loading, setLoading] = useState<boolean>(true);
    const { showSidebar } = useSidebar();
    const { getTags } = useVideo();

    useEffect(() => {
        const getAllTags = async () => {
            setLoading(true);
            const response = await getTags();
            if (response) {
                setTags(['All', ...response]);
            } else {
                console.log('Something went wrong!!');
            }
            setLoading(false);
        };
        getAllTags();
    }, []);

    return (
        <div className={`flex gap-4 items-center overflow-x-auto p-4 fixed z-10 top-[4rem] ${showSidebar ? 'left-[16.67%] w-[calc(100%-16.67%)]' : 'w-full'} transition-all bg-zinc-900 border-b border-gray-700`}>
            {loading ? (
                Array.from({ length: 11 }).map((_, index) => (
                    <LoadingState key={index} />
                ))
            ) : (
                tags.map((tag, index) => (
                    <button 
                        onClick={() => setActiveTag(tag.toLowerCase())} 
                        key={index} 
                        className={`${activeTag === tag.toLowerCase() ? 'bg-red-400' : 'bg-red-900 text-white'} text-sm font-semibold px-4 py-2 rounded-md whitespace-nowrap`}
                    >
                        {tag}
                    </button>
                ))
            )}
        </div>
    );
};

export default TagList;
