import React, { useEffect, useState } from "react";
import VideoDetails from "../components/VideoPage/Video/VideoDetails";
import Recommended from "../components/VideoPage/Recommended/Recommended";
import Comments from "../components/VideoPage/Comments/Comments";
import { useParams } from "react-router-dom";
import { useVideo } from "../providers/VideoProvider";
import { VideoCardTemplate } from "../templates/video_templates";
import CommentProvider from "../providers/CommentProvider";

const VideoPage: React.FC = () => {
  const { id } = useParams();
  const { getVideoDetails } = useVideo();
  const [video, setVideo] = useState<VideoCardTemplate | null>(null);
  const videoId = id ? id : "";
  useEffect(() => {
    const getVideo = async () => {
      
      const response = await getVideoDetails(videoId);
      if (response) {
        console.log("Video fetched successfully");
        setVideo(response);
      } else {
        console.log("Error loading video");
      }
    };
    getVideo();
  }, []);
  if (!video) return <div>Loading...</div>;
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-8">
        <VideoDetails video={video} />
        <CommentProvider>
          <Comments videoId={videoId} />
        </CommentProvider>
      </div>
      <div className="col-span-4">
        <Recommended />
      </div>
    </div>
  );
};

export default VideoPage;
