import React from 'react';
import { VideoCardTemplate } from '../../templates/video_templates';
import VideoCard from './VideoCard';
import { useSidebar } from '../../providers/SidebarProvider';

interface VideoGridProps {
    videos: VideoCardTemplate[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
    const { showSidebar } = useSidebar();

    return (
        <div className={`grid grid-cols-1 gap-4 p-6 ${showSidebar ? 'sm:grid-cols-4' : 'sm:grid-cols-5'}  pt-6 transition-all`}>
            {videos?.map((video) => (
                <VideoCard
                    key={video.videoId}
                    videoId={video.videoId}
                    title={video.title}
                    userDetails={video.userDetails}
                    views={video.views}
                    uploadTime={video.uploadTime}
                    thumbnail={video.thumbnail}
                    video={video.video}
                    duration={video.duration}
                />
            ))}
        </div>
    );
};

export default VideoGrid;
