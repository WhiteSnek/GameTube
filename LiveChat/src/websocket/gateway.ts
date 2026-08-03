import { WebSocketServer } from "ws";
import { ClientManager } from "./client.manager";
import { WebSocketPublisher } from "../publishers/websocket.publisher";
import { ChatService } from "../services/chat.service";
import { ChatController } from "../controller/chat.controller";
import { verifyToken } from "../middleware/chat.middleware";
import UserRepository from "../repository/user.repository";

export function createGateway(){

    const manager = new ClientManager();

    const publisher =
        new WebSocketPublisher(manager);

    const userRepository = new UserRepository();

    const service =
        new ChatService(publisher, userRepository);

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
        const token = url.searchParams.get("token")!;
        const data = verifyToken(token);
        if (!data) {
            ws.close();
            return;
        }
        const { guildId, userId } = data;
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