import React, { useState, useEffect, useRef } from 'react';
import formatDuration from '../../utils/formateDuration';

interface HoverThumbnailProps {
  duration: string; // Assumes duration is in a format that can be parsed
  thumbnail: string;
  video: string;
}

const HoverThumbnail: React.FC<HoverThumbnailProps> = ({ duration, thumbnail, video }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const parseDuration = (duration: string): number => {
    // Assuming duration is in the format "HH:MM:SS"
    const parts = duration.split(':').map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  };
  const [currentDuration, setCurrentDuration] = useState<number>(parseDuration(duration));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentDuration((prevDuration) => {
          if (prevDuration <= 0) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return Math.max(prevDuration - 1, 0);
        });
      }, 1000);
    } else {
      setCurrentDuration(parseDuration(duration));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, duration]);

  

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <video
          src={video}
          className='aspect-video w-[1000px] object-cover rounded-md bg-gray-900'
          autoPlay
          muted
          loop
        />
      ) : (
        <img
          src={thumbnail}
          className='aspect-video w-[1000px] object-cover rounded-md'
          alt="Thumbnail"
        />
      )}
      <span className="absolute bottom-0 right-0 px-2 text-xs py-1 m-2 text-white font-semibold bg-black opacity-70 rounded-md">
        {formatDuration(currentDuration)}
      </span>
    </div>
  );
}

export default HoverThumbnail;
