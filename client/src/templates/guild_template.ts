export interface CreateGuildTemplate {
    name: string;
    description: string;
    avatar: File | null;
    avatarUrl: string;
    coverImage: File | null;
    coverImageUrl: string;
    private: boolean;
}

export interface GuildDetails {
    id: string;
    name: string;
    description: string;
    avatar: File | null;
    avatarUrl: string;
    coverImage: File | null;
    coverImageUrl: string;
    private: boolean;
}