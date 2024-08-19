export interface VideoCardTemplate {
    videoId: string;
    title: string;
    userDetails: UserVideoCard;
    views: number;
    uploadTime: Date;
    thumbnail: string;
    video: string;
    duration: number;
}

export interface UserVideoCard {
    name: string;
    avatar: string;
    userId: string;
}
