import { db } from "../config/db.config";

class UnreadChatRepository {
  async getLastReadMessageDetails(userId: string, guildId: string) {
    try {
      const { rows } = await db.query(
        `
            SELECT
                last_read_message_id,
                last_read_at
            FROM read_chats
            WHERE user_id = $1
              AND guild_id = $2
            `,
        [userId, guildId],
      );

      return rows[0] ?? null;
    } catch (error) {
      console.error("Error retrieving last read chats:", error);
      throw new Error(
        `Failed to retrieve last read chats for owner: ${userId}`,
      );
    }
  }

  async getUnreadMessagesCount(userId: string, guildId: string) {
    try {
      const result = await db.query(
        `
                SELECT COUNT(*)
                FROM chats c
                JOIN read_chats rc
                ON rc.guild_id = c.guild_id
                WHERE rc.user_id = $2
                AND rc.guild_id = $1
                AND c.created_at >= (
                    SELECT created_at
                    FROM chats
                    WHERE id = rc.last_read_message_id
                )
                AND c.id <> rc.last_read_message_id;
                `,
        [guildId, userId],
      );
      return Number(result.rows[0].count);
    } catch (error) {
      console.error("Error retrieving unread message count:", error);
      throw new Error(
        `Failed to retrieve unread message count for owner: ${userId}`,
      );
    }
  }

  async updateLastReadMessage(userId: string, guildId: string, chatId: string) {
    await db.query(
      `
      INSERT INTO read_chats (
        user_id,
        guild_id,
        last_read_message_id,
        last_read_at
      )
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, guild_id)
      DO UPDATE
      SET
        last_read_message_id = EXCLUDED.last_read_message_id,
        last_read_at = NOW();
    `,
      [userId, guildId, chatId],
    );
  }
}

export default UnreadChatRepository;
