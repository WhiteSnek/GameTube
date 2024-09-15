import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoProps {
  video: string;  // URL of the video (HLS stream or MP4 file)
  thumbnail: string;  // URL of the thumbnail image
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
  preload: string;  // Add preload option
  sources: Source[];
  poster: string;  // To set the initial thumbnail
}

const Video: React.FC<VideoProps> = ({ video, thumbnail }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any | null>(null);

  const getVideoJsOptions = (videoUrl: string): VideoJsOptions => {
    const isHls = videoUrl.endsWith('.m3u8');
    return {
      autoplay: false,  // Keep autoplay false or set to true based on your requirement
      controls: true,   // Ensure controls are enabled
      responsive: true, // Maintain responsiveness
      fluid: true,      // Ensure fluid layout
      preload: 'auto',  // Add preload option to start loading the video when the player is created
      poster: thumbnail,  // Set the video thumbnail here
      sources: [
        {
          src: videoUrl,
          type: isHls ? 'application/x-mpegURL' : 'video/mp4',  // Set type based on video format
        },
      ],
    };
  };

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.classList.add('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const options = getVideoJsOptions(video);
      const player = videojs(videoElement, options, () => {
        videojs.log('Player is ready');
      });

      player.addClass('vjs-theme-city');
      playerRef.current = player;

      player.on('waiting', () => {
        videojs.log('Player is waiting');
      });

      player.on('dispose', () => {
        videojs.log('Player will dispose');
      });
    } else if (playerRef.current) {
      const options = getVideoJsOptions(video);
      playerRef.current.src(options.sources);
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video]);
  return (
    <div data-vjs-player style={{ width: '100%', height: '100%' }}>
      <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Video;
