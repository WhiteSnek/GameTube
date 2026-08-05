
import { db } from "../config/db.config";
import { Connection } from "../types";
class ConnectionRepository {
  async save(connection: Connection): Promise<void> {
    await db.query(
      `
      INSERT INTO connections (
        connection_id,
        guild_id,
        user_id
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (connection_id)
      DO UPDATE SET
        guild_id = EXCLUDED.guild_id,
        user_id = EXCLUDED.user_id
      `,
      [
        connection.connectionId,
        connection.guildId,
        connection.userId,
      ]
    );
  }

  async get(connectionId: string): Promise<Connection | null> {
    const result = await db.query(
      `
      SELECT
        connection_id,
        guild_id,
        user_id,
        role
      FROM connections
      WHERE connection_id = $1
      LIMIT 1
      `,
      [connectionId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return {
      connectionId: result.rows[0].connection_id,
      guildId: result.rows[0].guild_id,
      userId: result.rows[0].user_id,
      role: result.rows[0].role
    };
  }

  async getGuildConnections(guildId: string): Promise<Connection[]> {
    const result = await db.query(
      `
      SELECT
        connection_id,
        guild_id,
        user_id,
        role
      FROM connections
      WHERE guild_id = $1
      `,
      [guildId]
    );

    return result.rows.map((row: any) => ({
      connectionId: row.connection_id,
      guildId: row.guild_id,
      userId: row.user_id,
      role: row.role
    }));
  }

  async remove(connectionId: string): Promise<void> {
    await db.query(
      `
      DELETE FROM connections
      WHERE connection_id = $1
      `,
      [connectionId]
    );
  }
}

export default ConnectionRepository;