import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";

export default class ChatEvent extends BaseEvent {
    constructor(client: ChatbotClient) {
        super(client, "chat", false);
    }

    execute(username: string, message: string) {
        if (username === this.client.bot.username) return; // Ignore messages from the bot itself

        this.client.bot.chat(message);
    }
}