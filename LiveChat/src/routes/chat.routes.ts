import { Router } from "express";
import { ChatController } from "../controller/chat.controller";

export function createChatRouter(
    controller: ChatController
) {
    const router = Router();

    router.get("/", controller.getChatMessages.bind(controller));

    return router;
}