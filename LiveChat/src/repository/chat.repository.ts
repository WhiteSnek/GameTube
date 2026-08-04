import { db } from "../config/db.config";
import { Chat, MessageTypeLabel } from "../types";

class ChatRepository {
  async saveChatMessage(
    guildId: string,
    userId: string,
    message: string,
    messageType: number,
    replyTo: string | null,
  ) {
    const result = await db.query(
      `
    INSERT INTO chats (
      guild_id,
      sender_id,
      content,
      message_type,
      reply_to
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
      [guildId, userId, message, messageType, replyTo],
    );

    return result.rows[0];
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

      return result.rows.map((chat: any) => ({
        ...chat,
        message_type: MessageTypeLabel[chat.message_type] ?? "unknown",
      }));
    } catch (error) {
      console.error("Error retrieving chat messages:", error);
      throw new Error("Failed to retrieve chat messages");
    }
  }

  async editChatMessage(
    chatId: string,
    newContent: string,
    messageType: number,
  ): Promise<Chat> {
    try {
      const result = await db.query(
        `
      UPDATE chats c
      SET
          content = $1,
          message_type = $2,
          edited_at = NOW()
      FROM users u
      JOIN guild_members gm
        ON gm.user_id = u.id
      WHERE
          c.sender_id = u.id
      AND gm.guild_id = c.guild_id
      AND c.id = $3
      RETURNING
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
          gm.role,
          c.guild_id;
      `,
        [newContent, messageType, chatId],
      );

      const chat = result.rows[0];

      return {
        ...chat,
        message_type: MessageTypeLabel[chat.message_type],
      };
    } catch (error) {
      console.error("Error editing chat message:", error);
      throw new Error("Failed to edit chat message");
    }
  }

  async getChatOwnerId(chatId: string): Promise<string | null> {
    try {
      const result = await db.query(
        `
        SELECT sender_id
        FROM chats
        WHERE id = $1;
        `,
        [chatId],
      );
      return result.rows[0]?.sender_id || null;
    } catch (error) {
      console.error("Error retrieving chat owner ID:", error);
      throw new Error("Failed to retrieve chat owner ID");
    }
  }

  async deleteChat(chatId: string): Promise<Chat> {
    try {
      const result = await db.query(
        `
      UPDATE chats c
      SET
          deleted_at = NOW(),
          content = ''
      FROM users u
      JOIN guild_members gm
        ON gm.user_id = u.id
      WHERE
          c.sender_id = u.id
      AND gm.guild_id = c.guild_id
      AND c.id = $1
      RETURNING
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
          gm.role,
          c.guild_id;
      `,
        [chatId],
      );

      if (result.rowCount === 0) {
        throw new Error("Message not found.");
      }

      const chat = result.rows[0];

      return {
        ...chat,
        message_type: MessageTypeLabel[chat.message_type],
      };
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw new Error("Failed to delete chat");
    }
  }
}

export default ChatRepository;
