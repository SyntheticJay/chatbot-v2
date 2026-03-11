import dotenv from "dotenv";
dotenv.config({ quiet: true });

/**
 * Type representing the authentication method for the Minecraft bot, which can be either "offline" or "microsoft".
 */
type AuthType = "offline" | "microsoft";

/**
 * Interface representing the configuration for the Minecraft bot, including connection details and authentication settings.
 */
export interface BotConfiguration {
    host: string;
    port: number;
    auth: {
        type: AuthType;
        username: string;
    },
}

export const configuration: BotConfiguration = {
    host: process.env.MINECRAFT_HOST || "localhost",
    port: parseInt(process.env.MINECRAFT_PORT || "25565", 10),
    auth: {
        type: (process.env.MINECRAFT_AUTH_TYPE as AuthType) || "offline",
        username: process.env.MINECRAFT_USERNAME || "Chatbot",
    }
}