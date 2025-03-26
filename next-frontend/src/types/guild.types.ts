export interface GuildDetailsType{
    id: string;
    name: string,
    ownerId: string;
    description: string | undefined,
    avatar: string | undefined,
    cover_image: string | undefined,
    isPrivate: boolean,
    joined: boolean,
    createdAt: string
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
}

export interface JoinedGuildType {
    id: string;
    ownerId: string;
    name: string,
    avatar: string | undefined;
    role: string;
}