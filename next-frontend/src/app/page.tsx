'use client'
import { useEffect, useState } from 'react';
import { VideoCards } from "@/components/video_cards";
import { useVideo } from '@/context/video_provider';
import { VideoType } from '@/types/video.types';

export default function Home() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const { getVideos } = useVideo();

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await getVideos();
      setVideos(response)
    }
    fetchVideos()
  }, []); 

  return (
    <div>
        <VideoCards videos={videos} showAvatar/>
    </div>
  );
}
