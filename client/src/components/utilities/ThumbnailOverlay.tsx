import React from "react";
import { Link } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface ThumbnailOverlayProps {
  thumbnail: string;
  name: string;
  id: string;
  videoId: string;
}
const ThumbnailOverlay: React.FC<ThumbnailOverlayProps> = ({
  thumbnail,
  name,
  id,
  videoId
}) => {
  return (
    <div className="relative">
      <img
        src={thumbnail}
        alt={name}
        className="rounded-md w-full h-auto object-cover"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black rounded-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
      <Link
        to={`/videos/${videoId}?playlistId=${id}`}
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <PlayArrowIcon /> Play All
      </Link>
    </div>
  );
};

export default ThumbnailOverlay;
