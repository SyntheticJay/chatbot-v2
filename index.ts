import ChatbotClient  from "./src/Client";
import pino, {Logger} from "pino";

const logger: Logger = pino({
    level: "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
        },
    }
});

const client: ChatbotClient = new ChatbotClient(logger);

client.start().catch(error => {
    console.error("nooo", error);
});