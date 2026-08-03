import { ChatEvent } from "../types";

export interface Publisher {
  publishToGuild(
    guildId: string,
    event: ChatEvent
  ): Promise<void>;
}