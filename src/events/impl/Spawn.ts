import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";

export default class SpawnEvent extends BaseEvent {
    /**
     * Construct a new SpawnEvent
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, "spawn", false);
    }

    /**
     * Execute the event.
     *
     * @return void
     */
    execute(): void {
        this.client.logger.info("Bot has spawned in the world.");
    }
}