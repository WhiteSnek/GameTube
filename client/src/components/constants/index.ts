import { VideoCardTemplate } from "../../templates/video_templates";
import { PlayListsTemplate } from "../../templates/playlist_template";
import { OnePlaylist } from "../../templates/playlist_template";
import { Comment } from "../../templates/comment_template";

export const dummyVideos: VideoCardTemplate[] = [
    {
        videoId: "video1",
        title: "Exploring the Universe",
        userDetails: {
            name: "Alice Johnson",
            avatar: "https://my-gametube-bucket.s3.amazonaws.com/a40d1616-91ba-4688-bdde-186bab2ddb16/fbb5da69-b798-422d-b09c-0c55378b2e75.png ",
            userId: "user1"
        },
        views: 1532,
        uploadTime: new Date("2024-03-01T12:00:00Z"),
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY2BjiU9dOjulhGreAkzSEhpN7nLZPDdJiyA&s",
        video: "https://gametube-video-transcoded.s3.amazonaws.com/360p/index.m3u8",
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

export const dummyPlaylists: PlayListsTemplate[] = [
    {
        id: '1',
        name: 'Chill Vibes',
        thumbnail: 'https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg',
        length: 12,
        owner: 'John Doe',
        videoId: 'video1'
    },
    {
        id: '2',
        name: 'Workout Hits',
        thumbnail: 'https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg',
        length: 15,
        owner: 'Jane Smith',
        videoId: 'video5'
    },
    {
        id: '3',
        name: 'Top 50 Songs',
        thumbnail: 'https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg',
        length: 50,
        owner: 'Music Lover',
        videoId: 'video2'
    },
    {
        id: '4',
        name: 'Classic Rock',
        thumbnail: 'https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg',
        length: 20,
        owner: 'Rock Enthusiast',
        videoId: 'video3'
    },
    {
        id: '5',
        name: 'Indie Hits',
        thumbnail: 'https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg',
        length: 10,
        owner: 'Indie Fan',
        videoId: 'video4'
    }
];

export const playlistDummyData: OnePlaylist = {
    id: "playlist1",
    name: "My Favorite Videos",
    thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
    length: 5,
    owner: "user123",
    description: "A collection of my favorite videos covering topics like JavaScript, CSS, React, and Python.",  // Added description
    videos: [
        {
            videoId: "video1",
            title: "Learn JavaScript in 10 Minutes",
            userDetails: {
                name: "John Doe",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user1"
            },
            views: 1200,
            uploadTime: new Date("2024-08-01T10:00:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
            video: "https://example.com/video1.mp4",
            duration: 600
        },
        {
            videoId: "video2",
            title: "CSS Tricks for Beginners",
            userDetails: {
                name: "Jane Smith",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user2"
            },
            views: 950,
            uploadTime: new Date("2024-08-05T14:00:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
            video: "https://example.com/video2.mp4",
            duration: 720
        },
        {
            videoId: "video3",
            title: "React vs Angular: A Detailed Comparison",
            userDetails: {
                name: "Alice Johnson",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user3"
            },
            views: 3000,
            uploadTime: new Date("2024-08-10T09:30:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
            video: "https://example.com/video3.mp4",
            duration: 900
        },
        {
            videoId: "video4",
            title: "Understanding TypeScript",
            userDetails: {
                name: "Bob Brown",
                avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
                userId: "user4"
            },
            views: 1800,
            uploadTime: new Date("2024-08-12T11:00:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
            video: "https://example.com/video4.mp4",
            duration: 840
        },
        {
            videoId: "video5",
            title: "Advanced Python Programming",
            userDetails: {
                name: "Carol White",
                avatar: "https://example.com/user5-avatar.jpg",
                userId: "user5"
            },
            views: 2200,
            uploadTime: new Date("2024-08-15T16:00:00Z"),
            thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*Xca2Kg9G-aTTczNlAcaQnQ.jpeg",
            video: "https://example.com/video5.mp4",
            duration: 1080
        }
    ],
    views: 9150,
    createdAt: new Date("2024-08-01T08:00:00Z")
};

export const dummyComments: Comment[] = [
    {
        id: 1,
        message: "This is an amazing video! I learned so much.",
        user: {
            name: "John Doe",
            avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
            userRole: "Admin",
            userId: "user123"
        },
        createdAt: new Date("2024-08-20T10:30:00")
    },
    {
        id: 2,
        message: "Great content! Looking forward to more.",
        user: {
            name: "Jane Smith",
            avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
            userRole: "Member",
            userId: "user456"
        },
        createdAt: new Date("2024-08-20T11:00:00")
    },
    {
        id: 3,
        message: "I disagree with some points, but overall it's good.",
        user: {
            name: "Alice Johnson",
            avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
            userRole: "Moderator",
            userId: "user789"
        },
        createdAt: new Date("2024-08-20T11:30:00")
    },
    {
        id: 4,
        message: "Can you make a video on a similar topic?",
        user: {
            name: "Bob Brown",
            avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
            userRole: "Member",
            userId: "user012"
        },
        createdAt: new Date("2024-08-20T12:00:00")
    },
    {
        id: 5,
        message: "Awesome video! Keep up the good work.",
        user: {
            name: "Charlie Davis",
            avatar: "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
            userRole: "Member",
            userId: "user345"
        },
        createdAt: new Date("2024-08-20T12:30:00")
    }
];