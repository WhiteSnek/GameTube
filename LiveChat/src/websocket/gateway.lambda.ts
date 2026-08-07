import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

import { ChatController } from "../controller/chat.controller";
import ConnectionRepository from "../repository/connection.repository";
import { verifyToken } from "../utils/jwt";

const repository = new ConnectionRepository();

export async function handleWebSocket(
  event: APIGatewayProxyWebsocketEventV2,
  controller: ChatController,
) {
  const route = event.requestContext.routeKey;

  switch (route) {
    case "$connect": {
      const token = event.queryStringParameters?.token;

      if (!token) return { statusCode: 401 };

      const payload = verifyToken(token);

      if (!payload) return { statusCode: 401 };

      await repository.save({
        connectionId: event.requestContext.connectionId!,
        guildId: payload.guildId,
        userId: payload.userId,
        role: payload.role
      });

      return { statusCode: 200 };
    }

    case "$disconnect":
      await repository.remove(event.requestContext.connectionId!);

      return { statusCode: 200 };

    default: {
      const sender = await repository.get(event.requestContext.connectionId!);

      if (!sender) return { statusCode: 401 };

      const body = JSON.parse(event.body!);

      switch (body.action) {
        case "sendMessage":
          await controller.sendMessage(
            body.message,
            body.messageType,
            body.replyTo,
            sender,
          );
          break;

        case "editMessage":
          await controller.editMessage(sender, body.chatId, body.content, 0);
          break;

        case "deleteMessage":
          await controller.deleteMessage(sender, body.chatId);
          break;
        case "getOnlineUsers":
          await controller.getActiveConnections(body.guildId)
          break;
      }

      return {
        statusCode: 200,
      };
    }
  }
}
