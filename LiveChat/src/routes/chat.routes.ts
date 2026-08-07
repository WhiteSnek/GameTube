import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import { authenticate } from "../middleware/chat.middleware";

export function createChatRouter(
    controller: ChatController
) {
    const router = Router();

    router.get("/", controller.getChatMessages.bind(controller));
    router.get("/unread",authenticate, controller.getLastReadMessageDetails.bind(controller))
    router.get("/unread-count",authenticate, controller.getUnreadMessageCount.bind(controller))
    return router;
}