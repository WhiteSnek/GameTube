import { Publisher } from "../publishers/publisher";
import ChatRepository from "../repository/chat.repository";
import ConnectionRepository from "../repository/connection.repository";
import UnreadChatRepository from "../repository/unread.repository";
import UserRepository from "../repository/user.repository";
import { MessageTypeValue } from "../types";

export class ChatService {
  constructor(
    private readonly publisher: Publisher,
    private readonly userRepository: UserRepository,
    private readonly chatRepository: ChatRepository,
    private readonly unreadChatRepository: UnreadChatRepository,
    private readonly connectionRepository: ConnectionRepository
  ) {}

  async sendMessage(
    guildId: string,
    senderId: string,
    message: string,
    replyTo: string | null,
    messageType: "text" | "gif",
  ) {
    const sender = await this.userRepository.getUserDetails(senderId, guildId);

    if (!sender) {
      await this.publisher.publishToUser(senderId, guildId, {
        event: "ERROR",
        payload: {
          code: "FORBIDDEN",
          message: "Sender is not a member of this guild.",
        },
      });
      return;
    }

    if (replyTo) {
      const parent = await this.chatRepository.getMessageById(replyTo, guildId);

      if (!parent) {
        await this.publisher.publishToUser(senderId, guildId, {
          event: "ERROR",
          payload: {
            code: "NOT_FOUND",
            message:
              "Cannot reply to a message that doesn't exist in this guild.",
          },
        });
        return;
      }
    }

    const chat = await this.chatRepository.saveChatMessage(
      guildId,
      senderId,
      message,
      MessageTypeValue[messageType],
      replyTo,
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
        deleted_by: null,
        deleted_by_name: null,
        fullname: sender.fullname,
        avatar: sender.avatar,
        role: sender.role,
      },
    });
  }

  async getChatMessages(guildId: string) {
    return this.chatRepository.getChatMessages(guildId);
  }

  async editChatMessage(
    guildId: string,
    senderId: string,
    chatId: string,
    newContent: string,
    messageType: number,
  ) {
    const data = await this.chatRepository.getChatOwnerId(chatId);

    if (!data || !data.senderId) {
      await this.publisher.publishToUser(senderId, guildId, {
        event: "ERROR",
        payload: {
          code: "NOT_FOUND",
          message: "Message not found.",
        },
      });
      return;
    }

    if (data.senderId !== senderId) {
      await this.publisher.publishToUser(senderId, guildId, {
        event: "ERROR",
        payload: {
          code: "FORBIDDEN",
          message: "You can only edit your own messages.",
        },
      });
      return;
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

  async deleteMessage(
    guildId: string,
    senderId: string,
    senderRole: string,
    chatId: string,
  ) {
    const data = await this.chatRepository.getChatOwnerId(chatId);
    console.log("role in service: ", senderRole);
    if (!data || !data.senderId) {
      await this.publisher.publishToUser(senderId, guildId, {
        event: "ERROR",
        payload: {
          code: "NOT_FOUND",
          message: "Message not found.",
        },
      });
      return;
    }

    if (
      data.senderId !== senderId &&
      senderRole !== "LEADER" &&
      senderRole !== "CO_LEADER"
    ) {
      await this.publisher.publishToUser(senderId, guildId, {
        event: "ERROR",
        payload: {
          code: "FORBIDDEN",
          message: "You can only delete your own messages.",
        },
      });
      return;
    }

    const updatedMessage = await this.chatRepository.deleteChat(
      chatId,
      senderId,
    );

    await this.publisher.publishToGuild(guildId, {
      event: "MESSAGE_DELETED",
      payload: updatedMessage,
    });

    return updatedMessage;
  }

  async getLastReadMessageDetails(
    senderId: string,
    guildId: string,
  ): Promise<{ last_read_message_id: string; last_read_at: string } | null> {
    return await this.unreadChatRepository.getLastReadMessageDetails(
      senderId,
      guildId,
    );
  }

  async getUnreadMessageCount(senderId: string, guildId: string) {
    return this.unreadChatRepository.getUnreadMessagesCount(senderId, guildId);
  }

  async getActiveUsers(guildId: string){
    const connections = await this.connectionRepository.getActiveConnections(guildId);
    await this.publisher.publishToGuild(guildId, {
      event: "ACTIVE_CONNECTION_COUNT",
      payload: connections,
    });
  }
}
