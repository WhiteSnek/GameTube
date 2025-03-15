import VideoList from "@/components/videolist";
import videos from "@/data/videos.json";
import { HistoryIcon } from "lucide-react";
export default function History() {
  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="flex items-end gap-4">
        <HistoryIcon size={40} />
        <h1 className="text-5xl font-bold">History</h1>
      </div>
      <hr className="border-t border-red-700 my-4" />
      <VideoList videos={videos} />
    </div>
  );
}
