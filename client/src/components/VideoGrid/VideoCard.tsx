import React, { useState, useEffect } from "react";
import { VideoCardTemplate } from "../../templates/video_templates";
import formatDate from "../../utils/formatDate";
import formatDuration from "../../utils/formateDuration";
import formatViews from "../../utils/formatViews";
import truncateText from "../../utils/truncate_text";

const VideoCard: React.FC<VideoCardTemplate> = ({
  videoId,
  title,
  userDetails,
  views,
  uploadTime,
  thumbnail,
  video,
  duration,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [currentDuration, setCurrentDuration] = useState<number>(duration);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isHovered) {
      interval = setInterval(() => {
        setCurrentDuration((prevDuration) => {
          if (prevDuration <= 0) {
            clearInterval(interval!);
            return 0;
          }
          return Math.max(prevDuration - 1, 0);
        });
      }, 1000);
    } else {
      setCurrentDuration(duration);
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, duration]);

  return (
    <div className="text-white" key={videoId}>
      <div className="relative">
        {isHovered ? (
          <video
            src={video}
            className='aspect-video w-full object-fit rounded-md bg-gray-900'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            autoPlay
            muted
            loop
          />
        ) : (
          <img
            src={thumbnail}
            className='aspect-video w-full object-fit rounded-md'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        )}
        <span className="absolute bottom-0 right-0 px-2 text-xs py-1 m-2 font-semibold bg-black opacity-70 rounded-md">
          {formatDuration(currentDuration)}
        </span>
      </div>
      <div className='flex gap-4 mt-4'>
        <img src={userDetails.avatar} alt='avatar' className='h-8 w-8 rounded-full object-cover' />
        <div>
          <h1 className='font-bold text-lg'>{truncateText(title, 50)}</h1>
          <p className='text-gray-100 font-medium'>{userDetails.name}</p>
          <div className='flex gap-3 font-medium text-gray-300'>
            <p>{formatViews(views)} views</p>
            <p>{formatDate(uploadTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
