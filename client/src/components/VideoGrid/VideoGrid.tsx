import React from 'react';
import { VideoCardTemplate } from '../../templates/video_templates';
import VideoCard from './VideoCard';
import { useSidebar } from '../../providers/SidebarProvider';

interface VideoGridProps {
    videos: VideoCardTemplate[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
    const { showSidebar } = useSidebar();
    console.log(videos)
    return (
        <div className={`grid grid-cols-1 gap-4 p-6 ${showSidebar ? 'sm:grid-cols-4' : 'sm:grid-cols-5'}  pt-6 transition-all`}>
            {videos?.map((video) => (
                <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    owner={video.owner}
                    views={video.views}
                    created_at={video.created_at}
                    thumbnail={video.thumbnail}
                    video={video.video}
                    guild={video.guild}
                />
            ))}
        </div>
    );
};

export default VideoGrid;
