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
}

export default UnreadChatRepository;
