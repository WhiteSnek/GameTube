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
    private readonly client =
        new ApiGatewayManagementApiClient({
            endpoint: process.env.WEBSOCKET_ENDPOINT!,
        });

    async publishToGuild(
        guildId: string,
        event: ChatEvent,
    ): Promise<void> {

        console.log("Publishing to guild:", guildId);

        const connections =
            await this.repository.getGuildConnections(guildId);

        console.log("Connections:", connections);

        if (connections.length === 0){
            console.log("No active connections");
            return;
        }

        const payload = Buffer.from(
            JSON.stringify(event)
        );

        await Promise.all(
            connections.map(async connection => {

                try {

                    console.log("Sending to:", connection.connectionId);

                    await this.client.send(
                        new PostToConnectionCommand({
                            ConnectionId: connection.connectionId,
                            Data: payload,
                        }),
                    );

                    console.log("PostToConnection success:", response);

                } catch (error) {
                            console.error("PostToConnection failed:", {
                            connectionId: connection.connectionId,
                            name: error.name,
                            message: error.message,
                            statusCode: error.$metadata?.httpStatusCode,
                            requestId: error.$metadata?.requestId,
                        });
                    if (error instanceof GoneException) {
                        console.log("Removing stale connection:", connection.connectionId);
                        await this.repository.remove(
                            connection.connectionId,
                        );

                        return;
                    }

                    console.error(
                        `Failed to send to ${connection.connectionId}`,
                        error,
                    );
                }

            }),
        );
    }

}