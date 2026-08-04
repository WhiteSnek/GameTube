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

        const connections =
            await this.repository.getGuildConnections(guildId);

        if (connections.length === 0)
            return;

        const payload = Buffer.from(
            JSON.stringify(event)
        );

        await Promise.all(
            connections.map(async connection => {

                try {

                    await this.client.send(
                        new PostToConnectionCommand({
                            ConnectionId: connection.connectionId,
                            Data: payload,
                        }),
                    );

                } catch (error) {
                    if (error instanceof GoneException) {

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