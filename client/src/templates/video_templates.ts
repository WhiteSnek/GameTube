import { GuildCard } from "./guild_template";
import { UserCard } from "./user_template";
export interface VideoCardTemplate {
    id: string;
    title: string;
    description: string;
    video: string;
    thumbnail: string;
    owner: UserCard;
    guild: GuildCard;
    views: number;
    duration: string;
    likes: number
    created_at: string;
    tags: string[];
}

export interface VideoUrls {
    original: string;
    video360: string;
    video480: string;
    video720: string;
}

export interface VideoDetailsTemplate {
    id: string;
    title: string;
    description: string;
    urls: VideoUrls;
    thumbnail: string;
    owner: UserCard;
    guild: GuildCard;
    views: number;
    duration: string;
    likes: number
    created_at: string;
    tags: string[];
}

export interface UploadVideoTemplate {
    title: string;
    description: string;
    video: File | null;
    videoUrl: string;
    owner: string;
    guild: string;
    thumbnail: File | null;
    thumbnailUrl: string;
    tags: string[];
    duration: number
}

export interface UserHistory {
    viewed_at: string;
    video_details: VideoCardTemplate
  }