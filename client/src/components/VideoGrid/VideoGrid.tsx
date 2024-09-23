import React from "react";
import { VideoCardTemplate } from "../../templates/video_templates";
import VideoCard from "./VideoCard";
import { useSidebar } from "../../providers/SidebarProvider";

interface VideoGridProps {
  videos: VideoCardTemplate[];
  gridSize?: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, gridSize = 4 }) => {
  const { showSidebar } = useSidebar();
  console.log(videos);
  return (
    <div
      className={`grid grid-cols-1 ${
        showSidebar
          ? `sm:grid-cols-${gridSize}`
          : `sm:grid-cols-${gridSize + 1}`
      }  gap-4 transition-all`}
    >
      {videos?.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          owner={video.owner}
          views={video.views}
          duration={video.duration}
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
