import { GuildCard } from "./guild_template";
import { UserCard } from "./user_template";
export interface VideoCardTemplate {
    id: string;
    title: string;
    description: string;
    video: string;
    thumbnail: string;
    owner: UserCard;
    guild: GuildCard;
    views: number;
    created_at: Date;
}

