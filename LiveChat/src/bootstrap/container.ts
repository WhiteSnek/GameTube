import { ClientManager } from "../websocket/client.manager";
import { WebSocketPublisher } from "../publishers/websocket.publisher";

import UserRepository from "../repository/user.repository";
import ChatRepository from "../repository/chat.repository";

import { ChatService } from "../services/chat.service";
import { ChatController } from "../controller/chat.controller";
import { ApiGatewayPublisher } from "../publishers/apigateway.publisher";

export function createContainer() {

    const manager = new ClientManager();

    const publisher =
        process.env.RUNTIME === "lambda"
            ? new ApiGatewayPublisher()
            : new WebSocketPublisher(manager);

    const userRepository = new UserRepository();
    const chatRepository = new ChatRepository();

    const service = new ChatService(
        publisher,
        userRepository,
        chatRepository
    );

    const controller = new ChatController(service);

    return {
        manager,
        controller
    };
}