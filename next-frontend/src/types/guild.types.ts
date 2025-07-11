export interface GuildDetailsType{
    id: string;
    name: string,
    ownerId: string;
    description: string | undefined,
    avatar: string | undefined,
    cover_image: string | undefined,
    isPrivate: boolean,
    joined: boolean,
    createdAt: string,
    tags: string[]
}

export interface CreateGuildType {
    name: string,
    description: string | undefined,
    avatar: string | undefined,
    cover_image: string | undefined,
    isPrivate: boolean,
    tags: string[]
}

export interface GuildsType {
    id: string;
    ownerId: string;
    name: string,
    description: string | undefined;
    avatar: string | undefined;
    members: number;
    joined: boolean
}

export interface JoinedGuildType {
    id: string;
    ownerId: string;
    name: string,
    avatar: string | undefined;
    role: string;
}

export interface GuildMembersType{
    userId: string;
    username: string;
    userAvatar: string;
    role: string;
}