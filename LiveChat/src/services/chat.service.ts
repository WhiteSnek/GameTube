import { Publisher } from "../publishers/publisher";
import ChatRepository from "../repository/chat.repository";
import UserRepository from "../repository/user.repository";
import { MessageType } from "../types";

export class ChatService {
  constructor(
    private readonly publisher: Publisher,
    private readonly userRepository: UserRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  async sendMessage(guildId: string, senderId: string, message: string) {
    const sender = await this.userRepository.getUserDetails(senderId, guildId);

    if (!sender) {
      throw new Error("Sender is not a member of this guild.");
    }

    const chat = await this.chatRepository.saveChatMessage(
      guildId,
      senderId,
      message,
      MessageType.TEXT,
      null,
    );

    await this.publisher.publishToGuild(guildId, {
      event: "MESSAGE_RECEIVED",
      payload: {
        id: chat.id,
        content: chat.content,
        message_type: chat.message_type,
        reply_to: chat.reply_to,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        edited_at: chat.edited_at,
        deleted_at: chat.deleted_at,
        fullname: sender.fullname,
        avatar: sender.avatar,
        role: sender.role,
      },
    });
  }

  async getChatMessages(guildId: string) {
    console.log("in service")
    return await this.chatRepository.getChatMessages(guildId);
  }

  async editChatMessage(
    guildId: string,
    senderId: string,
    chatId: string,
    newContent: string,
    messageType: number,
  ) {
    const ownerId = await this.chatRepository.getChatOwnerId(chatId);

    if (!ownerId) {
      throw new Error("Message not found.");
    }

    if (ownerId !== senderId) {
      throw new Error("You can only edit your own messages.");
    }

    const updatedMessage = await this.chatRepository.editChatMessage(
      chatId,
      newContent,
      messageType,
    );

    await this.publisher.publishToGuild(guildId, {
      event: "MESSAGE_UPDATED",
      payload: updatedMessage,
    });

    return updatedMessage;
  }

  async deleteMessage(guildId: string, senderId: string, chatId: string) {
    const ownerId = await this.chatRepository.getChatOwnerId(chatId);
    if (!ownerId) {
      throw new Error("Message not found.");
    }
    if (ownerId !== senderId) {
      throw new Error("You can only edit your own messages.");
    }
    const updatedMessage = await this.chatRepository.deleteChat(chatId);
    await this.publisher.publishToGuild(guildId, {
      event: "MESSAGE_DELETED",
      payload: updatedMessage,
    });
    return updatedMessage;
  }
}
