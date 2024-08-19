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