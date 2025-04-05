"use client";
import Comments from "@/components/comments";
import VideoSection from "@/components/video";
import CommentProvider from "@/context/comment_provider";
import { useVideo } from "@/context/video_provider";
import { VideoDetailstype, VideoImages } from "@/types/video.types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Video() {
  const { getVideoById, getVideoFiles } = useVideo();
  const params = useParams();
  const videoId = Array.isArray(params.videoId)
    ? params.videoId[0]
    : params.videoId; // Ensure it's a string

  const [video, setVideo] = useState<VideoDetailstype | null>(null);

  if (!videoId) return null;

  useEffect(() => {
    

    const fetchVideo = async () => {
      try {
        const response = await getVideoById(videoId);
        if (!response) return;

        const videoFiles: VideoImages[] | null = await getVideoFiles([videoId]);
        if (!videoFiles || videoFiles.length === 0) return;

        setVideo({
          ...response,
          thumbnail: videoFiles[0].thumbnail,
          videoUrl: videoFiles[0].video,
          guildAvatar: videoFiles[0].avatar,
        });
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    };

    fetchVideo();
    
  }, [videoId]);

  console.log("Current Video:", video);
  if (!video) return null;
  return (
    <div className="relative grid grid-cols-12 p-4 gap-2">
      <div className="col-span-8">
        <VideoSection video={video} />
        <CommentProvider>
          <Comments videoId={video.id} /> 
        </CommentProvider>
      </div>
      <div className="col-span-4">
        <h1 className="text-2xl font-bold">Recommended Videos</h1>
        <hr className="border-t border-red-700 my-4" />
        {/* <VideoList videos={videos} /> */}
      </div>
    </div>
  );
}
