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
    coverImage: File | null;
    coverImageUrl: string;
}

export interface UserDetails {
    id: string;
    username: string;
    password: string;
    email: string;
    name: string;
    dob: string;
    gender: string;
    avatar: string;
    coverImage: string;
    googleId: string | null;
    createdAt: Date;
    updatedAt: Date;
    guild: string | null;
}

export interface UserCard {
    name: string;
    avatar: string;
    userId: string;
}

export interface UserComment {
    name: string;
    avatar: string;
    userRole: string;
    userId: string;
}