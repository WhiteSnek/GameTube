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

        console.log("========== PUBLISH ==========");
        console.log("Guild:", guildId);
        console.log("Event:", JSON.stringify(event));

        const connections =
            await this.repository.getGuildConnections(guildId);

        console.log("Connections:", JSON.stringify(connections));

        if (connections.length === 0) {
            console.log("No active connections found.");
            return;
        }

        const payload = Buffer.from(JSON.stringify(event));

        await Promise.all(
            connections.map(async (connection) => {

                console.log("--------------------------------");
                console.log("Sending to:", connection.connectionId);

                try {

                    const response = await this.client.send(
                        new PostToConnectionCommand({
                            ConnectionId: connection.connectionId,
                            Data: payload,
                        })
                    );

                    console.log(
                        "Successfully sent to:",
                        connection.connectionId
                    );

                    console.log(
                        "AWS Response:",
                        JSON.stringify(response)
                    );

                } catch (err) {

                    const error = err as any;

                    console.error("PostToConnection failed");

                    console.error({
                        connectionId: connection.connectionId,
                        name: error?.name,
                        message: error?.message,
                        statusCode: error?.$metadata?.httpStatusCode,
                        requestId: error?.$metadata?.requestId,
                        stack: error?.stack,
                    });

                    if (error instanceof GoneException) {

                        console.log(
                            "Removing stale connection:",
                            connection.connectionId
                        );

                        await this.repository.remove(
                            connection.connectionId
                        );
                    }
                }
            })
        );

        console.log("========== END PUBLISH ==========");
    }
}