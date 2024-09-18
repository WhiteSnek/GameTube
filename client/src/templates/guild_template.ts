export interface CreateGuildTemplate {
    name: string;
    description: string;
    avatar: File | null;
    avatarUrl: string;
    cover_image: File | null;
    cover_imageUrl: string;
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

export interface GuildCard {
    id: string;
    name: string;
    avatar: string;
}

export interface GetGuilds {
    guildId: string;
    userRole: string;
    guildName: string;
    guildAvatar: string;
    joinedAt: string
  }

export interface GuildMembers {
    userId: string;
    userRole: string;
    userName: string;
    userAvatar: string;
    joinedAt: string;
  }

export interface AllGuilds {
    id: string;
    guild_name: string;
    avatar: string;
    username: string
}