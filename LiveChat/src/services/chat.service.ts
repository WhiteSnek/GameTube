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
                    senderAvatar: "https://idp.whitesnek.xyz/images/profiles/nikhilkr2604/a155163f-12c8-4226-8456-7e36710a762e",
                    senderRole: "LEADER",
                    content: message,
                    createdAt:new Date()
                }
            }
        );

    }

}