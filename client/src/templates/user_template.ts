export interface LoginTemplate {
    email: string;
    password: string;
}

export interface RegisterTemplate {
    username: string;
    password: string;
    email: string;
    name: string;
    dob: string;
    gender: string;
    avatar: File | null;
    avatarUrl: string;
    cover_image: File | null;
    cover_imageUrl: string;
}

export interface UserDetails {
    id: string;
    username: string;
    email: string;
    name: string;
    dob: string;
    gender: string;
    avatar: string;
    cover_image: string;
    createdAt: Date;
    updatedAt: Date;
    guild: string | null;
}

export interface UserCard {
    username: string;
    avatar: string;
    id: string;
}

export interface UserComment {
    name: string;
    avatar: string;
    userRole: string;
    userId: string;
}