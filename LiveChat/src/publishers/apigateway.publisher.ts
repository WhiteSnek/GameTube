import {
  ApiGatewayManagementApiClient,
  GoneException,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import { Publisher } from "./publisher";
import { ChatEvent } from "../types";
import ConnectionRepository from "../repository/connection.repository";

export class ApiGatewayPublisher implements Publisher {
  private readonly repository = new ConnectionRepository();

  private readonly client = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKET_ENDPOINT!,
  });

  async publishToGuild(
    guildId: string,
    event: ChatEvent,
  ): Promise<void> {
    const connections = await this.repository.getGuildConnections(guildId);

    await Promise.all(
      connections.map((connection) =>
        this.send(connection.connectionId, event)
      )
    );
  }

  async publishToUser(
    userId: string,
    guildId: string,
    event: ChatEvent,
  ): Promise<void> {
    const connections = await this.repository.getUserConnections(userId, guildId);

    await Promise.all(
      connections.map((connection) =>
        this.send(connection.connectionId, event)
      )
    );
  }

  private async send(
    connectionId: string,
    event: ChatEvent,
  ): Promise<void> {
    try {
      await this.client.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify(event)),
        })
      );
    } catch (err) {
      const error = err as any;

      console.error("Failed to send websocket message", {
        connectionId,
        name: error?.name,
        message: error?.message,
      });

      if (error instanceof GoneException) {
        await this.repository.remove(connectionId);
      }
    }
  }
}