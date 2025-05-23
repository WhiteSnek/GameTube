'use client'
import { useVideo } from "@/context/video_provider";
import { cn } from "@/lib/utils";
import { VideoType } from "@/types/video.types";
import formatDate from "@/utils/formatDate";
import formatDuration from "@/utils/formateDuration";
import formatViews from "@/utils/formatViews";
import truncateText from "@/utils/truncate_text";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export const VideoHoverEffect = ({
  items,
  className,
  showAvatar
}: {
  items: VideoType[];
  className?: string;
  showAvatar?: boolean
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4",
        className
      )}
    >
      {items.length > 0 &&
        items.map((item, idx) => (
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
                duration={item.duration.toString()}
                video={item.videoUrl}
                thumbnail={item.thumbnail}
              />
              <div className="flex gap-4 p-4 items-center">
                {showAvatar && <img
                  src={item.guildAvatar}
                  alt="avatar"
                  className="h-8 w-8 aspect-square rounded-full object-cover"
                />}
                <div>
                  <h1 className="text-sm md:text-lg dark:text-white">
                    {truncateText(item.title, 50)}
                  </h1>
                  <p className=" font-light text-zinc-600 dark:text-zinc-300">
                    {item.guildName} · <span className="text-zinc-500">posted by {item.ownerName}</span>
                  </p>
                  <div className="flex gap-3 font-medium text-zinc-600 dark:text-gray-300">
                    <p>{formatViews(item.views)} views</p>
                    <p>{formatDate(item.uploadDate)}</p>
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
        <div>{children}</div>
      </div>
    </div>
  );
};

import videojs from "video.js";
import "video.js/dist/video-js.css";


interface HoverThumbnailProps {
  duration: string;
  thumbnail: string;
  video: string;
}

export const HoverThumbnail: React.FC<HoverThumbnailProps> = ({
  duration,
  thumbnail,
  video,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentDuration, setCurrentDuration] = useState<number>(
    parseDuration(duration)
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any | null>(null);
  const { checkVideo } = useVideo();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  function parseDuration(duration: string): number {
    const parts = duration.split(":").map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  }

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await checkVideo(video);
      setIsAvailable(available);
    };

    checkAvailability();
  }, [video]);

  useEffect(() => {
    if (isHovered && videoRef.current && isAvailable) {
      // Initialize video.js player
      const player = videojs(videoRef.current, {
        autoplay: true,
        muted: true,
        loop: true,
        controls: false,
        preload: "auto",
        fluid: true,
        responsive: true,
        sources: [
          {
            src: video,
            type: "application/x-mpegURL", 
          },
        ],
      });

      playerRef.current = player;
    }

    return () => {
      // Dispose of the player on unmount or when hover ends
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isHovered, video]);

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setCurrentDuration((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCurrentDuration(parseDuration(duration));
    }
  }, [isHovered, duration]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        isAvailable === false ? (
          <div className="aspect-video w-full bg-zinc-950 flex items-center justify-center text-sm text-white rounded-t-md">
             This video is still processing. Please come again later.
          </div>
        ) : (
          <div data-vjs-player>
            <video
              ref={videoRef}
              className="video-js aspect-video w-full object-contain rounded-t-md bg-zinc-950"
            />
          </div>
        )
      ) : (
        <Image
          src={thumbnail}
          className="aspect-video w-full object-contain rounded-t-md bg-zinc-950"
          alt="Thumbnail"
          width={1980}
          height={1080}
        />
      )}
      <span className="absolute bottom-0 right-0 px-2 text-xs py-1 m-2 text-white font-semibold bg-black opacity-70 rounded-md">
        {formatDuration(currentDuration)}
      </span>
    </div>
  );
};