import React from "react";
import Video from "./Video";
import Details from "./Details";
import { VideoCardTemplate } from "../../../templates/video_templates";
interface VideoDetailsProps{
  video: VideoCardTemplate
}
const VideoDetails: React.FC<VideoDetailsProps> = ({video}) => {
  return (
    <div className="p-8">
      <Video video={video.video} thumbnail={video.thumbnail} videoId={video.id} />
      <Details video={video} />
    </div>
  );
};

export default VideoDetails;
