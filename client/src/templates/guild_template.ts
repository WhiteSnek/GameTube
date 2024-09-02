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
    guild_name: string;
    guild_description: string;
    avatar: string;
    cover_image: string;
    privacy: boolean;
}