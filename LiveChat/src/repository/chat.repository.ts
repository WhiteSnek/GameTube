import { db } from "../config/db.config";
import { Chat, MessageTypeLabel } from "../types";

class ChatRepository {
  async saveChatMessage(
    guildId: string,
    userId: string,
    message: string,
    messageType: number,
    replyTo: string | null,
  ): Promise<void> {
    try {
      await db.query(
        `
            INSERT INTO chats (guild_id, sender_id, content, message_type, reply_to)
            VALUES ($1, $2, $3, $4, $5);
            `,
        [guildId, userId, message, messageType, replyTo],
      );
    } catch (error) {
      console.error("Error saving chat message:", error);
      throw new Error("Failed to save chat message");
    }
  }

  async getChatMessages(guildId: string): Promise<Chat[]> {
    try {
      const result = await db.query(
        `
      SELECT
          c.id,
          c.content,
          c.message_type,
          c.reply_to,
          c.created_at,
          c.updated_at,
          c.edited_at,
          c.deleted_at,
          u.fullname,
          u.avatar,
          gm.role
      FROM chats c
      JOIN users u
          ON c.sender_id = u.id
      JOIN guild_members gm
          ON gm.user_id = c.sender_id
         AND gm.guild_id = c.guild_id
      WHERE c.guild_id = $1
      ORDER BY c.created_at ASC;
      `,
        [guildId],
      );

      return result.rows.map((chat) => ({
        ...chat,
        message_type: MessageTypeLabel[chat.message_type] ?? "unknown",
      }));
    } catch (error) {
      console.error("Error retrieving chat messages:", error);
      throw new Error("Failed to retrieve chat messages");
    }
  }
}

export default ChatRepository;
