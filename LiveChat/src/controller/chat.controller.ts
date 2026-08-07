import { Request, Response } from "express";
import { ChatUserContext, MessageType } from "../types";
import { ChatService } from "../services/chat.service";
import { AuthenticatedRequest } from "../middleware/chat.middleware";

export class ChatController {
  constructor(private service: ChatService) {}

  async sendMessage(
    message: string,
    messageType: "text" | "gif",
    replyTo: string | null,
    sender: ChatUserContext,
  ) {
    await this.service.sendMessage(
      sender.guildId,
      sender.userId,
      message,
      replyTo,
      messageType,
    );
  }

  getChatMessages = async (req: Request, res: Response) => {
    const { guildId } = req.query as { guildId: string };
    if (!guildId) {
      return res.status(400).json({ error: "Guild ID is required." });
    }
    const messages = await this.service.getChatMessages(guildId);
    return res.json(messages);
  };

  async editMessage(
    sender: ChatUserContext,
    chatId: string,
    content: string,
    messageType: number = MessageType.TEXT,
  ) {
    await this.service.editChatMessage(
      sender.guildId,
      sender.userId,
      chatId,
      content,
      messageType,
    );
  }

  async deleteMessage(sender: ChatUserContext, chatId: string) {
    await this.service.deleteMessage(sender.guildId, sender.userId,sender.role, chatId);
  }

  async getLastReadMessageDetails(req: AuthenticatedRequest, res: Response){
    const userId = req.user?.userId
    const guildId = req.user?.guildId
    if(!userId || !guildId){
      return res.status(400).json({ error: "Both User ID & Guild ID are required." });
    }
    const message = await this.service.getLastReadMessageDetails(userId,guildId);
    if (!message) {
        return res.status(404).json({
            error: "Last read message not found."
        });
    }
    return res.json(message);
  }

  async getUnreadMessageCount(req: AuthenticatedRequest, res: Response){
    const userId = req.user?.userId
    const { guildId } = req.query as { guildId: string };
    if(!userId || !guildId){
      return res.status(400).json({ error: "Both User ID & Guild ID are required." });
    }
    const count = await this.service.getUnreadMessageCount(userId,guildId);
    return res.json({count});
  }

  async getActiveConnections(guildId: string){
    await this.service.getActiveUsers(guildId)
  }
}
