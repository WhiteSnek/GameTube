import Comments from "@/components/comments";
import VideoSection from "@/components/video";
import VideoList from "@/components/videolist";
import videos from '@/data/videos.json'
export default function Video() {
  return (
    <div className="relative grid grid-cols-12 p-4 gap-2">
      <div className="col-span-8">
        <VideoSection />
      <Comments />
      </div>
      <div className="col-span-4">
        <h1 className="text-2xl font-bold">Recommended Videos</h1>

      <hr className="border-t border-red-700 my-4" />
      <VideoList videos={videos}/>
      </div>
    </div>
  );
}
