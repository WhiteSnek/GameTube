export interface VideoType {
    id: string;
    title: string;
    thumbnail: string;
    videoUrl: string;
    duration: string;
    ownerName: string;
    guildName: string;
    guildAvatar: string;
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
    guildName: string;
    guildAvatar: string;
    uploadDate: string;
    tags: string[];
}