import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

import { ClientManager } from "./client.manager";
import { WebSocketPublisher } from "../publishers/websocket.publisher";
import { ChatService } from "../services/chat.service";
import { ChatController } from "../controller/chat.controller";

export function createGateway(){

    const manager = new ClientManager();

    const publisher =
        new WebSocketPublisher(manager);

    const service =
        new ChatService(publisher);

    const controller =
        new ChatController(service);

    const wss =
        new WebSocketServer({
            port:8080
        });

    wss.on("connection",(ws,req)=>{

        const url = new URL(
            req.url!,
            "http://localhost"
        );

        const guildId =
            url.searchParams.get("guildId")!;

        const userId =
            url.searchParams.get("userId")!;

        manager.add({
            ws,
            guildId,
            userId,
            fullName:userId
        });

        ws.on("message",async(raw)=>{

            const body = JSON.parse(raw.toString());

            if(body.action==="sendMessage"){

                const sender =
                    manager.get(ws);

                if(!sender) return;

                await controller.sendMessage(
                    body.message,
                    sender
                );

            }

        });

        ws.on("close",()=>{

            manager.remove(ws);

        });

    });

}