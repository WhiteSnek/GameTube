import { db } from "../config/db.config";
import { Chat, MessageTypeLabel, ReplyToPreview } from "../types";

const REPLY_JOIN_SQL = `
  LEFT JOIN chats AS reply_parent
    ON reply_parent.id = c.reply_to
  LEFT JOIN users AS reply_parent_user
    ON reply_parent_user.id = reply_parent.sender_id
`;

const REPLY_SELECT_SQL = `
  reply_parent.id           AS reply_to_id,
  reply_parent.content      AS reply_to_content,
  reply_parent.deleted_at   AS reply_to_deleted_at,
  reply_parent_user.fullname AS reply_to_fullname
`;

export interface SavedChatRow {
  id: string;
  content: string;
  message_type: string;
  reply_to: ReplyToPreview | null;
  created_at: string;
  updated_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  guild_id: string;
  sender_id: string;
}

function shapeReplyTo(row: any): ReplyToPreview | null {
  if (!row.reply_to_id) return null;

  return {
    id: row.reply_to_id,
    fullname: row.reply_to_fullname,
    content: row.reply_to_deleted_at ? null : row.reply_to_content,
    deleted: !!row.reply_to_deleted_at,
  };
}

function shapeChat(row: any): Chat {
  return {
    id: row.id,
    content: row.content,
    message_type: MessageTypeLabel[row.message_type] ?? "unknown",
    reply_to: shapeReplyTo(row),
    created_at: row.created_at,
    updated_at: row.updated_at,
    edited_at: row.edited_at,
    deleted_at: row.deleted_at,
    fullname: row.fullname,
    avatar: row.avatar,
    role: row.role,
  };
}

class ChatRepository {
  async getMessageById(messageId: string, guildId: string) {
    const result = await db.query(
      `SELECT id, guild_id, deleted_at FROM chats WHERE id = $1 AND guild_id = $2`,
      [messageId, guildId],
    );
    return result.rows[0] ?? null;
  }

  async saveChatMessage(
    guildId: string,
    userId: string,
    message: string,
    messageType: number,
    replyTo: string | null,
  ): Promise<SavedChatRow> {
    const result = await db.query(
      `
    WITH inserted AS (
      INSERT INTO chats (
        guild_id,
        sender_id,
        content,
        message_type,
        reply_to
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    )
    SELECT
      inserted.*,
      ${REPLY_SELECT_SQL}
    FROM inserted
    LEFT JOIN chats AS reply_parent
      ON reply_parent.id = inserted.reply_to
    LEFT JOIN users AS reply_parent_user
      ON reply_parent_user.id = reply_parent.sender_id;
    `,
      [guildId, userId, message, messageType, replyTo],
    );

    const row = result.rows[0];

    return {
      id: row.id,
      content: row.content,
      message_type: MessageTypeLabel[row.message_type] ?? "unknown",
      reply_to: shapeReplyTo(row),
      created_at: row.created_at,
      updated_at: row.updated_at,
      edited_at: row.edited_at,
      deleted_at: row.deleted_at,
      guild_id: row.guild_id,
      sender_id: row.sender_id,
    };
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
          gm.role,
          ${REPLY_SELECT_SQL}
      FROM chats c
      JOIN users u
          ON c.sender_id = u.id
      JOIN guild_members gm
          ON gm.user_id = c.sender_id
         AND gm.guild_id = c.guild_id
      ${REPLY_JOIN_SQL}
      WHERE c.guild_id = $1
      ORDER BY c.created_at ASC;
      `,
        [guildId],
      );

      return result.rows.map(shapeChat);
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
      WITH updated AS (
        UPDATE chats c
        SET
            content = $1,
            message_type = $2,
            edited_at = NOW()
        WHERE c.id = $3
        RETURNING *
      )
      SELECT
          updated.id,
          updated.content,
          updated.message_type,
          updated.reply_to,
          updated.created_at,
          updated.updated_at,
          updated.edited_at,
          updated.deleted_at,
          updated.guild_id,
          u.fullname,
          u.avatar,
          gm.role,
          ${REPLY_SELECT_SQL}
      FROM updated
      JOIN users u
          ON updated.sender_id = u.id
      JOIN guild_members gm
          ON gm.user_id = updated.sender_id
         AND gm.guild_id = updated.guild_id
      LEFT JOIN chats AS reply_parent
          ON reply_parent.id = updated.reply_to
      LEFT JOIN users AS reply_parent_user
          ON reply_parent_user.id = reply_parent.sender_id;
      `,
        [newContent, messageType, chatId],
      );

      if (result.rowCount === 0) {
        throw new Error("Message not found.");
      }

      return shapeChat(result.rows[0]);
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
      WITH updated AS (
        UPDATE chats c
        SET
            deleted_at = NOW(),
            content = ''
        WHERE c.id = $1
        RETURNING *
      )
      SELECT
          updated.id,
          updated.content,
          updated.message_type,
          updated.reply_to,
          updated.created_at,
          updated.updated_at,
          updated.edited_at,
          updated.deleted_at,
          updated.guild_id,
          u.fullname,
          u.avatar,
          gm.role,
          ${REPLY_SELECT_SQL}
      FROM updated
      JOIN users u
          ON updated.sender_id = u.id
      JOIN guild_members gm
          ON gm.user_id = updated.sender_id
         AND gm.guild_id = updated.guild_id
      LEFT JOIN chats AS reply_parent
          ON reply_parent.id = updated.reply_to
      LEFT JOIN users AS reply_parent_user
          ON reply_parent_user.id = reply_parent.sender_id;
      `,
        [chatId],
      );

      if (result.rowCount === 0) {
        throw new Error("Message not found.");
      }

      return shapeChat(result.rows[0]);
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw new Error("Failed to delete chat");
    }
  }
}

export default ChatRepository;
