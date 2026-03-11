import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";

export default class SpawnEvent extends BaseEvent {
    constructor(client: ChatbotClient) {
        super(client, "spawn", false);
    }

    execute(): void {
        this.client.logger.info("Bot has spawned in the world.");
    }
}