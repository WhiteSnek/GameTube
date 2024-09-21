import React, { useEffect, useRef } from 'react';
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

const Video: React.FC<VideoProps> = ({ video, thumbnail, videoId }) => {
  const {user} = useUser();
  if(!user) return <div>Something went wrong...</div>
  const { increaseViews, addtoHistory } = useVideo();
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any | null>(null);

  const getVideoJsOptions = (videoUrl: string): VideoJsOptions => {
    const isHls = videoUrl.endsWith('.m3u8');
    return {
      autoplay: false,
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

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.classList.add('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const options = getVideoJsOptions(video.video720);
      const player = videojs(videoElement, options, () => {
        videojs.log('Player is ready');
      });

      player.addClass('vjs-theme-city');
      playerRef.current = player;

      // Track the timeupdate event to check video progress
      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
        const duration = player.duration();
        if(!duration || !currentTime) return <div>Something went wrong...</div>
        if (duration > 0 && currentTime >= duration / 2) {
          // Ensure we only increase views once
          player.off('timeupdate');  // Stop listening to timeupdate to prevent multiple triggers
          increaseViews(videoId).catch(err => {
            console.error('Failed to increase views:', err);
          });
          addtoHistory({userId: user.id, videoId}).catch(err => {
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
    } else if (playerRef.current) {
      const options = getVideoJsOptions(video.video720);
      playerRef.current.src(options.sources);
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video, videoId, increaseViews]);

  return (
    <div data-vjs-player className='w-full h-full'>
      <div ref={videoRef} className='w-full h-full'/>
    </div>
  );
};

export default Video;
