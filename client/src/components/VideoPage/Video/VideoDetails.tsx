import React from "react";
import Video from "./Video";
import Details from "./Details";
import { VideoDetailsTemplate } from "../../../templates/video_templates";
interface VideoDetailsProps{
  video: VideoDetailsTemplate
}
const VideoDetails: React.FC<VideoDetailsProps> = ({video}) => {
  return (
    <div className="px-4 sm:p-8">
      <Video video={video.urls} thumbnail={video.thumbnail} videoId={video.id} />
      <Details video={video} />
    </div>
  );
};

export default VideoDetails;
