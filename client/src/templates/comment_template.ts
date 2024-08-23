import { UserComment } from "./user_template"


export interface Comment{
    id: number;
    message: string;
    user: UserComment;
    createdAt: Date;

}