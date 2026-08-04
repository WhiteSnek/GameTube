import jwt from "jsonwebtoken";

const verifyToken = (token: string): { userId: string; guildId: string } | null => {
    try {
        const secret = process.env.CHAT_JWT_SECRET;
        if (!secret) {
            console.error("CHAT_JWT_SECRET not configured");
            return null;
        }

        const decoded = jwt.verify(token, secret) as { userId: string; guildId: string };
        return decoded;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}

export { verifyToken };