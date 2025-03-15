'use client'

import { useState } from 'react';
import { VideoCards } from "@/components/video_cards";
import TagList from '@/components/tags';

export default function Home() {
  const tags = ["All", "Gaming", "Music", "Tech", "News", "Sports", "Movies", "Anime", "Education", "Food", "Vlogs"];
  const [activeTag, setActiveTag] = useState<string>("all");

  return (
    <div>
      <TagList tags={tags} activeTag={activeTag} setActiveTag={setActiveTag} />
      <div className='mt-14'>
      <VideoCards />
      </div>
    </div>
  );
}
