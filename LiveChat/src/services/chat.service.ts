import { Publisher } from "../publishers/publisher";
import ChatRepository from "../repository/chat.repository";
import UserRepository from "../repository/user.repository";
import { MessageType } from "../types";

export class ChatService {
    constructor(
        private readonly publisher: Publisher,
        private readonly userRepository: UserRepository,
        private readonly chatRepository: ChatRepository
    ) {}

    async sendMessage(
        guildId: string,
        senderId: string,
        message: string
    ) {
        const sender = await this.userRepository.getUserDetails(
            senderId,
            guildId
        );

        if (!sender) {
            throw new Error("Sender is not a member of this guild.");
        }

        await this.publisher.publishToGuild(guildId, {
            event: "MESSAGE_RECEIVED",
            payload: {
                id: null,
                content: message,
                message_type: "text",
                reply_to: null,
                created_at: new Date().toISOString(),
                updated_at: null,
                edited_at: null,
                deleted_at: null,
                fullname: sender.fullname,
                avatar: sender.avatar,
                role: sender.role,
            },
        });

        await this.chatRepository.saveChatMessage(
            guildId,
            senderId,
            message,
            MessageType.TEXT,
            null
        );
    }

    async getChatMessages(guildId: string) {
        return await this.chatRepository.getChatMessages(guildId);
    }
}