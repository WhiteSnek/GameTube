"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";
import VideoDetails from "./details";
import { SlidersHorizontal, Gauge, Monitor } from "lucide-react";
const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState("720p");

  const handlePlaybackSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed; // Ensure TypeScript recognizes this
    }
    setPlaybackSpeed(speed);
  };

  const handleVideoQualityChange = (quality: string) => {
    // Logic to handle video quality change (implement adaptive streaming or switch video source)
    setVideoQuality(quality);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleMouseEnterVolume = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    setShowVolumeSlider(true);
  };

  const handleMouseLeaveVolume = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 500); // Delay of 500ms (adjust if needed)
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    if (video.readyState >= 1) {
      updateDuration();
    }

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowThumbnail(false)
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = parseFloat(e.target.value);
    setCurrentTime(videoRef.current.currentTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const muteState = !videoRef.current.muted;
    videoRef.current.muted = muteState;
    setIsMuted(muteState);
    if(!isMuted) setVolume(0)
    else setVolume(videoRef.current.volume)
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setVolume(newVolume);
  };

  

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const resetHideControlsTimer = () => {
    setShowControls(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowControls(false), 2500);
  };

  useEffect(() => {
    resetHideControlsTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div
      className="flex flex-col items-center px-8 py-4 relative"
      onMouseMove={resetHideControlsTimer}
      onClick={resetHideControlsTimer}
    >
      <div className="relative w-full max-w-3xl">
        <video
          ref={videoRef}
          src="https://temp-gametube-videos.s3.us-east-1.amazonaws.com/2d125f98-3377-487c-86a3-09a616f41a2a/d3f0e016-6ca9-44c7-b2a9-9529db54b71a/4581188b-bcb6-41fa-98c0-a20fbcd2a39a.mp4"
          className="w-full rounded-lg shadow-lg"
          style={{ pointerEvents: "none" }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {showThumbnail && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNWMEKB19dQr8ikNRrxW09pt7bWpLY7hXtWA&s' alt="Video Thumbnail" className="w-full rounded-lg shadow-lg" />
            <button
              onClick={togglePlayPause}
              className="absolute text-white bg-black/60 cursor-pointer p-4 rounded-full"
            >
              <Play size={48} />
            </button>
          </div>
        )}
        {/* Custom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-black/60 bg-opacity-50 flex items-center justify-between rounded-b-lg transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          } ${isFullscreen ? "fixed bottom-0 w-full" : ""}`}
        >
          {/* Play/Pause */}
          <button onClick={togglePlayPause} className="text-white">
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            step="0.1"
            onChange={handleSeek}
            className="w-full mx-3 appearance-none h-2 bg-gray-700 rounded-lg cursor-pointer"
            style={{
              background: `linear-gradient(to right, red ${(currentTime / duration) * 100}%, gray ${
                (currentTime / duration) * 100
              }%)`,
            }}
          />

          {/* Time Display */}
          <span className="text-white text-sm w-1/8">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Mute/Unmute & Volume Control */}
          <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnterVolume}
            onMouseLeave={handleMouseLeaveVolume}
          >
            {/* Mute/Unmute Button */}
            <button onClick={toggleMute} className="text-white ml-3 cursor-pointer">
              {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            {/* Vertical Volume Slider */}
            {showVolumeSlider && (
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center bg-black/60 bg-opacity-70 px-3 py-4 rounded-lg">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-32 w-4 appearance-none cursor-pointer rounded-lg"
                  style={{
                    writingMode: "vertical-rl", // Fix inverted direction
                    direction: "rtl", // Fix fill starting from bottom
                    background: `linear-gradient(to top, red ${
                      volume * 100
                    }%, gray ${volume * 100}%)`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white ml-3 cursor-pointer">
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          {/* Settings Button */}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="text-white ml-3 cursor-pointer mt-1">
              <Settings size={24} />
            </button>

            {/* Settings Menu */}
            {showSettings && (
              <div className="absolute bottom-12 right-0 bg-black/60  text-white p-4 rounded-xl w-48 shadow-lg">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-600 pb-2">
                <SlidersHorizontal size={20} />
                <p className="text-sm font-semibold">Settings</p>
              </div>
        
              {/* Playback Speed */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge size={16} />
                  <p className="text-sm">Speed</p>
                </div>
                <select
                  value={playbackSpeed}
                  onChange={(e) => handlePlaybackSpeedChange(parseFloat(e.target.value))}
                  className="w-full bg-zinc-800 text-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
        
              {/* Video Quality */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Monitor size={16} />
                  <p className="text-sm">Quality</p>
                </div>
                <select
                  value={videoQuality}
                  onChange={(e) => handleVideoQualityChange(e.target.value)}
                  className="w-full bg-zinc-800 text-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
      <VideoDetails />
    </div>
  );
};

export default VideoSection;
