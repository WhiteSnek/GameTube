import { Publisher } from "../publishers/publisher";
import UserRepository from "../repository/user.repository";

export class ChatService {
    constructor(
        private readonly publisher: Publisher,
        private readonly userRepository: UserRepository
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
                senderId: sender.id,
                senderName: sender.fullname,
                senderAvatar: sender.avatar,
                senderRole: sender.role,
                content: message,
                replyTo: null,
                createdAt: new Date().toISOString(),
            },
        });
    }
}