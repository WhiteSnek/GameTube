import { UserCard } from "./user_template";
export interface VideoCardTemplate {
    videoId: string;
    title: string;
    userDetails: UserCard;
    views: number;
    uploadTime: Date;
    thumbnail: string;
    video: string;
    duration: number;
}


