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
