"use client";
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector"; // Import plugin
import { VideoDetailstype } from "@/types/video.types";
import { useVideo } from "@/context/video_provider";
import VideoDetails from "./details";

interface VideoSectionProps {
  video: VideoDetailstype;
}

const VideoSection: React.FC<VideoSectionProps> = ({ video }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const watchedTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasCountedViewRef = useRef(false);
  const { addView, checkVideo } = useVideo();

  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const getVideoJsOptions = (url: string) => ({
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    preload: "auto",
    aspectRatio: "16:9",
    poster: video.thumbnail,
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    sources: [
      {
        src: url,
        type: url.endsWith(".m3u8")
          ? "application/x-mpegURL"
          : "video/mp4",
      },
    ],
  });

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await checkVideo(video.videoUrl);
      console.log(available)
      setIsAvailable(available);
    };
    checkAvailability();
  }, [video.videoUrl]);

  useEffect(() => {
    if (!video.videoUrl || !videoRef.current || isAvailable !== true) return;

    if (!playerRef.current) {
      const videoElement = document.createElement("video");
      videoElement.classList.add("video-js", "vjs-default-skin");
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, getVideoJsOptions(video.videoUrl), () => {
        (player as any).hlsQualitySelector({ displayCurrentQuality: true });
      });

      player.on("timeupdate", () => {
        const current = player.currentTime();
        if (!current) return;
        const delta = current - lastTimeRef.current;

        if (delta > 0 && delta < 1.5) {
          watchedTimeRef.current += delta;
        }

        lastTimeRef.current = current;

        if (
          !hasCountedViewRef.current &&
          watchedTimeRef.current >= parseInt(video.duration) / 3
        ) {
          hasCountedViewRef.current = true;
          addView(video.id);
        }
      });

      playerRef.current = player;
    } else {
      const player = playerRef.current;
      player.src({
        src: video.videoUrl,
        type: video.videoUrl.endsWith(".m3u8")
          ? "application/x-mpegURL"
          : "video/mp4",
      });
      player.play();
    }
  }, [video.videoUrl, isAvailable]);

  if (isAvailable === false) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8 text-center text-red-500 text-lg">
        This video is still processing. Please come again later.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
      <VideoDetails video={video} />
    </div>
  );
};

export default VideoSection;
