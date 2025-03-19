export interface UserType {
    id: string,
    fullname: string,
    email: string,
    avatar: string,
    coverImage: string
    createdAt: string
}

export interface SignUpUser {
    fullname: string,
    email: string,
    password: string,
    avatar: string,
    dob: string,
    coverImage: string
}