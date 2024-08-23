import { VideoCardTemplate } from "./video_templates";

export interface PlayListsTemplate{
    id: string;
    name: string;
    thumbnail: string;
    length: number;
    owner: string;
    videoId: string;
}

export interface OnePlaylist{
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    length: number;
    owner: string;
    videos: VideoCardTemplate[];
    views: number;
    createdAt: Date;
}