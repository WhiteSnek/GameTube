import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useVideo } from '../../../providers/VideoProvider';
import { VideoUrls } from '../../../templates/video_templates';
import { useUser } from '../../../providers/UserProvider';

interface VideoProps {
  video: VideoUrls;  // URL of the video (HLS stream or MP4 file)
  thumbnail: string;  // URL of the thumbnail image
  videoId: string;  // Unique ID of the video
}

interface Source {
  src: string;
  type: string;
}

interface VideoJsOptions {
  autoplay: boolean;
  controls: boolean;
  responsive: boolean;
  fluid: boolean;
  aspectRatio: string;
  preload: string;
  sources: Source[];
  poster: string;
}

// Define a type for valid resolution keys
type VideoResolution = '360' | '480' | '720';

const Video: React.FC<VideoProps> = ({ video, thumbnail, videoId }) => {
  const { user } = useUser();
  const { increaseViews, addtoHistory } = useVideo();
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any | null>(null);
  const [currentResolution, setCurrentResolution] = useState<VideoResolution>('720'); // Default resolution

  const getVideoJsOptions = (videoUrl: string): VideoJsOptions => {
    const isHls = videoUrl.endsWith('.m3u8');
    return {
      autoplay: true, // Set autoplay to true for immediate play
      controls: true,
      responsive: true,
      fluid: true,
      aspectRatio: '16:9',
      preload: 'auto',
      poster: thumbnail,
      sources: [
        {
          src: videoUrl,
          type: isHls ? 'application/x-mpegURL' : 'video/mp4',
        },
      ],
    };
  };

  const handleResolutionChange = (resolution: VideoResolution) => {
    setCurrentResolution(resolution);
    let newVideoUrl;
    if (resolution === '360') newVideoUrl = video.video360; 
    else if (resolution === '480') newVideoUrl = video.video480;
    else if (resolution === '720') newVideoUrl = video.video720;

    if (newVideoUrl) {
      const options = getVideoJsOptions(newVideoUrl); // Get new options for the selected resolution
      if (playerRef.current) {
        playerRef.current.src(options.sources); // Update source
        playerRef.current.load(); // Load the new video
        playerRef.current.play(); // Play the new video
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.classList.add('video-js', 'vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const options = getVideoJsOptions(video.video720); // Initialize with 720p
      const player = videojs(videoElement, options, () => {
        videojs.log('Player is ready');
      });

      player.addClass('vjs-theme-city');
      playerRef.current = player;

      // Track the timeupdate event to check video progress
      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
        const duration = player.duration();
        if (!duration || !currentTime) return;
        if (user && duration > 0 && currentTime >= duration / 2) {
          player.off('timeupdate'); // Prevent multiple triggers
          increaseViews(videoId).catch(err => {
            console.error('Failed to increase views:', err);
          });
          addtoHistory({ userId: user.id, videoId }).catch(err => {
            console.error('Failed to add video to history:', err);
          });
        }
      });

      player.on('waiting', () => {
        videojs.log('Player is waiting');
      });

      player.on('dispose', () => {
        videojs.log('Player will dispose');
      });
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video, videoId, increaseViews]); // Dependencies for useEffect

  return (
    <div className='relative w-full h-full'>
      <div data-vjs-player className='w-full h-full'>
        <div ref={videoRef} className='w-full h-full' />
      </div>
      <div className='absolute bg-black/20 top-2 right-2 flex justify-center items-center'>
        <select
          id="resolution-select"
          value={currentResolution}
          onChange={(e) => handleResolutionChange(e.target.value as VideoResolution)}
          className="bg-zinc-900 text-white p-2 rounded shadow-lg"
        >
          <option value="720">720p</option>
          <option value="480">480p</option>
          <option value="360">360p</option>
        </select>
      </div>
    </div>
  );
};

export default Video;
