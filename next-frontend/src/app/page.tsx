'use client'

import { useEffect, useState } from 'react';
import { VideoCards } from "@/components/video_cards";
import TagList from '@/components/tags';
import { useVideo } from '@/context/video_provider';
import { VideoType } from '@/types/video.types';

export default function Home() {
  const tags = ["All", "Gaming", "Music", "Tech", "News", "Sports", "Movies", "Anime", "Education", "Food", "Vlogs"];
  const [activeTag, setActiveTag] = useState<string>("all");
  const [videos, setVideos] = useState<VideoType[] | null>(null)
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
      <TagList tags={tags} activeTag={activeTag} setActiveTag={setActiveTag} />
      <div className='mt-14'>
        <VideoCards videos={videos} showAvatar/>
      </div>
    </div>
  );
}
