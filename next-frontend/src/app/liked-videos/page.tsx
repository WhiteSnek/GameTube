'use client'
import VideoList from "@/components/videolist";
import { useVideo } from "@/context/video_provider";
import { VideoImages, VideoType } from "@/types/video.types";
import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
export default function LikedVideos() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const { getLikedVideos, getVideoFiles } = useVideo()
  useEffect(()=>{
    const fetchVideos = async() =>{
      try {
        const response = await getLikedVideos()
        if(!response) return
        const videoIds = response.map((video) => video.id);
        const videoFiles: VideoImages[] | null = await getVideoFiles(videoIds);
        if (!videoFiles || videoFiles.length === 0) return;
  
          const newVideos = response.map((video, idx) => ({
            ...video,
            thumbnail: videoFiles[idx]?.thumbnail,
            videoUrl: videoFiles[idx]?.video,
            guildAvatar: videoFiles[idx]?.avatar,
          }));
        setVideos(newVideos)
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    }
    fetchVideos()
    
  },[])
  if(videos.length === 0) return <div>Loading...</div>
  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="flex items-end gap-4">
        <ThumbsUp size={40} />
        <h1 className="text-5xl font-bold">Liked Videos</h1>
      </div>
      <hr className="border-t border-red-700 my-4" />
      <VideoList videos={videos} />
    </div>
  );
}
