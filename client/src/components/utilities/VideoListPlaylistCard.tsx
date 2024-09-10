import React from "react";
import { VideoCardTemplate } from "../../templates/video_templates";
// import formatDuration from "../../utils/formateDuration";
// import formatDate from "../../utils/formatDate";
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import { Link } from "react-router-dom";
import formatViews from "../../utils/formatViews";
interface VideoListProps {
  video: VideoCardTemplate;
  index: number;
}

const VideoListPlaylistCard: React.FC<VideoListProps> = ({ video,index }) => {
    // console.log(video.duration)
  return (
    <Link to={`/videos/${video.id}`} className="flex items-center justify-between p-4 hover:bg-zinc-800 rounded-lg">
      <div className="flex items-start gap-4">
        <p className="text-gray-200">{index}</p>
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="aspect-video w-full object-fit rounded-md h-20"
          />
          <span className="absolute bottom-0 right-0 px-2 text-xs text-white py-1 m-2 font-semibold bg-black opacity-70 rounded-md">
            {2000}
          </span>
        </div>
        <div>
        <h1 className="text-white text-xl font-bold">{video.title}</h1>
        <div className="flex gap-2 text-gray-300 text-sm">
            <p>{video.owner.name}</p>
            <p>{formatViews(video.views)} views</p>
            {/* <p>{formatDate(video.created_at)}</p> */}
        </div>
        </div>
      </div>
      <button className='rounded-full h-11 aspect-square flex justify-center items-center bg-gray-400/60 hover:bg-gray-300/30 text-white' title='more'><MoreVertOutlinedIcon /></button>
    </Link>
  );
};

export default VideoListPlaylistCard;
