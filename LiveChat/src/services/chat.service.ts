import { Publisher } from "../publishers/publisher";
import { Client } from "../types";

export class ChatService {

    constructor(
        private publisher: Publisher
    ){}

    async sendMessage(
        message: string,
        sender: Client
    ){

        await this.publisher.publishToGuild(
            sender.guildId,
            {
                event: "MESSAGE_RECEIVED",
                payload:{
                    senderId: sender.userId,
                    senderName: sender.fullName,
                    replyTo: null,
                    senderProfilePicture: null,
                    message,
                    createdAt:new Date()
                }
            }
        );

    }

}