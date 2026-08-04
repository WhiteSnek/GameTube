import { Request, Response } from "express";
import { ChatUserContext, MessageType } from "../types";
import { ChatService } from "../services/chat.service";

export class ChatController {
  constructor(private service: ChatService) {}

  async sendMessage(message: string, sender: ChatUserContext) {
    await this.service.sendMessage(sender.guildId, sender.userId, message);
  }

  getChatMessages = async (req: Request, res: Response) => {
    console.log("In controller")
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
    messageType: number = MessageType.TEXT
  ) {
    await this.service.editChatMessage(
      sender.guildId,
      sender.userId,
      chatId,
      content,
      messageType
    );
  }

  async deleteMessage(
    sender: ChatUserContext,
    chatId: string,
  ) {
    await this.service.deleteMessage(
      sender.guildId,
      sender.userId,
      chatId
    );
  }
}
