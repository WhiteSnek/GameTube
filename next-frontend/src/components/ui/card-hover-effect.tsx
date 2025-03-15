'use client'
import { cn } from "@/lib/utils";
import formatDuration from "@/utils/formateDuration";
import truncateText from "@/utils/truncate_text";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export const VideoHoverEffect = ({
  items,
  className,
}: {
  items: {
    id: number;
    video_title: string;
    thumbnail_link: string;
    video_link: string;
    video_duration: string;
    views: string;
    upload_time: string;
    channel_name: string
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={`/video/${item.id}`}
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-red-500/[0.8] dark:bg-zinc-800/[0.8] block rounded-xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
          <HoverThumbnail
            duration={item.video_duration}
            video={item.video_link}
            thumbnail={item.thumbnail_link}
          />

          <div className="flex gap-4 mt-4">
            <img
              src={item.thumbnail_link}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <h1 className="font-bold text-lg dark:text-white">{truncateText(item.video_title, 50)}</h1>
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">{item.channel_name}</p>
              <div className="flex gap-3 font-medium text-zinc-600 dark:text-gray-300">
                <p>{item.views} views</p>
                <p>{item.upload_time}</p>
              </div>
            </div>
          </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-lg h-full w-full overflow-hidden bg-white dark:bg-zinc-900 relative z-20 shadow-2xl",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};


interface HoverThumbnailProps {
  duration: string; 
  thumbnail: string;
  video: string;
}

export const HoverThumbnail: React.FC<HoverThumbnailProps> = ({ duration, thumbnail, video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentDuration, setCurrentDuration] = useState<number>(parseDuration(duration));
  const intervalRef = useRef<number | null>(null);

  function parseDuration(duration: string): number {
    const parts = duration.split(":").map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  }

  useEffect(() => {
    if (isHovered) {
      intervalRef.current = window.setInterval(() => {
        setCurrentDuration((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setCurrentDuration(parseDuration(duration));
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, duration]);

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isHovered ? (
        <video
          src={video}
          className="aspect-video w-full object-contain rounded-md bg-zinc-950"
          autoPlay
          muted
          loop
        />
      ) : (
        <img
          src={thumbnail}
          className="aspect-video w-full object-contain rounded-md bg-zinc-950"
          alt="Thumbnail"
        />
      )}
      <span className="absolute bottom-0 right-0 px-2 text-xs py-1 m-2 text-white font-semibold bg-black opacity-70 rounded-md">
        {formatDuration(currentDuration)}
      </span>
    </div>
  );
};
