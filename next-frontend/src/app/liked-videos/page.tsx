import VideoList from "@/components/videolist";
import videos from "@/data/videos.json";
import { ThumbsUp } from "lucide-react";
export default function LikedVideos() {
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
