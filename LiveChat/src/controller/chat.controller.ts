import { Request, Response } from "express";
import { Client, MessageType } from "../types";
import { ChatService } from "../services/chat.service";

export class ChatController {
  constructor(private service: ChatService) {}

  async sendMessage(message: string, sender: Client) {
    await this.service.sendMessage(sender.guildId, sender.userId, message);
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
    sender: Client,
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
    sender: Client,
    chatId: string,
  ) {
    await this.service.deleteMessage(
      sender.guildId,
      sender.userId,
      chatId
    );
  }
}
