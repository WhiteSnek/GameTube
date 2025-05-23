export interface VideoType {
    entityId?: string;
    id: string;
    title: string;
    thumbnail: string;
    videoUrl: string;
    duration: string;
    views: number;
    ownerName: string;
    
    guildName: string;
    guildAvatar: string;
    uploadDate: string;
}

export interface UploadVideoType {
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    duration: number;
    guildId: string;
    isPrivate: boolean;
    tags: string[];
}

export interface VideoImages {
    thumbnail: string;
    video: string;
    avatar: string;
  }

  export interface VideoDetailstype {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    duration: string;
    ownerName: string;
    guildId: string;
    guildName: string;
    guildAvatar: string;
    uploadDate: string;
    views: number;
    tags: string[];
    likes: number;
}

export interface HistoryType{
    [date: string]: VideoType[]
}