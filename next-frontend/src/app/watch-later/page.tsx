import VideoList from "@/components/videolist";
import videos from "@/data/videos.json";
import { Clock } from "lucide-react";
export default function WatchLater() {
  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="flex items-end gap-4">
        <Clock size={40} />
        <h1 className="text-5xl font-bold">Watch Later</h1>
      </div>

      <hr className="border-t border-red-700 my-4" />
      <VideoList videos={videos} />
    </div>
  );
}
