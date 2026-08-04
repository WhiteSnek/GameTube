import { db } from "../config/db.config";
import { UserDetails } from "../types";

class UserRepository {
  async getUserDetails(userId: string, guildId: string): Promise<UserDetails> {
    const userDetails = await db.query(
      `
        SELECT
        u.fullname,
        u.avatar,
        gm.guild_id,
        gm.role
        FROM guild_members gm
        JOIN users u
        ON u.id = gm.user_id
        WHERE gm.guild_id = $1
        AND gm.user_id = $2;
            `,
      [guildId, userId]
    );
    if (userDetails.rowCount === 0) {
      throw new Error("User not found");
    }
    return userDetails.rows[0];
  }
}

export default UserRepository;
