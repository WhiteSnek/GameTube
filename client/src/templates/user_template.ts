export interface LoginTemplate {
    username: string;
    password: string;
}

export interface RegisterTemplate {
    username: string;
    password: string;
    email: string;
    name: string;
    dob: Date;
    gender: string;
    avatar: File | null;
    avatarUrl: string;
    coverImage: File | null;
    coverImageUrl: string;
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