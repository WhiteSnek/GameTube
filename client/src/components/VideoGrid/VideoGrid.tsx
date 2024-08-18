import React, { useEffect, useState } from 'react'
import { VideoCardTemplate } from '../../templates/video_templates'
import VideoCard from './VideoCard';
import { useSidebar } from '../../providers/SidebarProvider';

const VideoGrid:React.FC = () => {
    const [videos,setVideos] = useState<VideoCardTemplate[]>([]);
    const {showSidebar} = useSidebar()
    const dummyVideos: VideoCardTemplate[] = [
        {
            videoId: "video1",
            title: "Exploring the Universe",
            userDetails: {
                name: "Alice Johnson",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user1"
            },
            views: 1532,
            uploadTime: new Date("2024-03-01T12:00:00Z"),
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY2BjiU9dOjulhGreAkzSEhpN7nLZPDdJiyA&s",
            video: "https://videos.pexels.com/video-files/27300951/12115045_2560_1440_60fps.mp4",
            duration: 3600 // 1 hour
        },
        {
            videoId: "video2",
            title: "The Wonders of Nature",
            userDetails: {
                name: "Bob Smith",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user2"
            },
            views: 8745,
            uploadTime: new Date("2024-02-20T08:30:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:680/1*KSOAgbYOUwI6ZrxUdtik9w.jpeg",
            video: "https://videos.pexels.com/video-files/27300951/12115045_2560_1440_60fps.mp4",
            duration: 1800 // 30 minutes
        },
        {
            videoId: "video3",
            title: "Cooking 101: The Basics",
            userDetails: {
                name: "Charlie Brown",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user3"
            },
            views: 9320,
            uploadTime: new Date("2024-01-15T16:00:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
            video: "https://videos.pexels.com/video-files/27300951/12115045_2560_1440_60fps.mp4",
            duration: 2400 // 40 minutes
        },
        {
            videoId: "video4",
            title: "Introduction to Quantum Mechanics",
            userDetails: {
                name: "Diana Prince",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user4"
            },
            views: 4567,
            uploadTime: new Date("2024-02-05T11:00:00Z"),
            thumbnail: "https://blog.designs.ai/wp-content/uploads/2023/03/6400cd5af613500013a52452-1080x607.jpg",
            video: "https://videos.pexels.com/video-files/27300951/12115045_2560_1440_60fps.mp4",
            duration: 5400 // 1.5 hours
        }
    ];

    useEffect(()=>{
        setVideos(dummyVideos)
    },[])
  return (
    <div className={`grid grid-cols-1  gap-4 p-6 ${showSidebar ? 'ml-[16.67%] sm:grid-cols-3' : 'sm:grid-cols-4'} mt-[7.5rem] pt-6 transition-all`}>
      {videos?.map((video) => (
                <VideoCard
                    key={video.videoId}
                    videoId={video.videoId}
                    title={video.title}
                    userDetails={video.userDetails}
                    views={video.views}
                    uploadTime={video.uploadTime}
                    thumbnail={video.thumbnail}
                    video={video.video}
                    duration={video.duration}
                />
            ))}
    </div>
  )
}

export default VideoGrid
