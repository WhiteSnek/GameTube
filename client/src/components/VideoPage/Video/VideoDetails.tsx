import React from "react";
import Video from "./Video";
import Details from "./Details";
import { dummyVideos } from "../../constants";
const VideoDetails: React.FC = () => {
    const video = dummyVideos[0];
  return (
    <div className="p-8">
      <Video video={video.video} thumbnail={video.thumbnail} />
      <Details video={video} />
    </div>
  );
};

export default VideoDetails;
