import { createGateway } from "./websocket/gateway";
import dotenv from "dotenv";

dotenv.config();

createGateway();

console.log("Running...");