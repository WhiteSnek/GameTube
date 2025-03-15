import { VideoHoverEffect } from "../ui/card-hover-effect";
import videos from '@/data/videos.json'
export function VideoCards() {
  return (
    <div className="px-8">
      <VideoHoverEffect items={videos} />
    </div>
  );
}