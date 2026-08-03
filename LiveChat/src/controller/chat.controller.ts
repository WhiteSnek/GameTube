import { Client } from "../types";
import { ChatService } from "../services/chat.service";

export class ChatController{

    constructor(
        private service: ChatService
    ){}

    async sendMessage(
        message:string,
        sender:Client
    ){

        await this.service.sendMessage(
            message,
            sender
        );

    }

}