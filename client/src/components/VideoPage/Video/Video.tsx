import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoProps {
    video: string;
    thumbnail: string;
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
    sources: Source[];
    poster: string;  // To set the initial thumbnail
}

const Video: React.FC<VideoProps> = ({ video, thumbnail }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any | null>(null);

  const videoJsOptions: VideoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    poster: thumbnail,  // Set the video thumbnail here
    sources: [
      {
        src: video,
        type: 'video/mp4',
      },
    ],
  };

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.classList.add('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, videoJsOptions, () => {
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
      playerRef.current.src([{ src: video, type: 'video/mp4' }]);
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video]);

  return (
    <div data-vjs-player style={{ width: '100%', height: '100%' }} >
      <div ref={videoRef} style={{ width: '100%', height: '100%' }}/>
    </div>
  );
}

export default Video;
