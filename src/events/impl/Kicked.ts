import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";

export default class KickedEvent extends BaseEvent {
    /**
     * Construct a new KickedEvent
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, "kicked", false);
    }

    /**
     * Execute the event.
     *
     * @return void
     */
    async execute(reason: string, loggedIn: boolean): Promise<void> {
        this.client.logger.error(`Bot was kicked from the server: ${reason}`);

        if (this.client.config.autoReconnect) {
            const reconnectDelay = this.client.config.reconnectDelay;

            this.client.logger.info(`Attempting to reconnect in ${reconnectDelay / 1000} seconds...`);

            setTimeout(async () => {
                await this.client.restart();
            }, reconnectDelay);
        }
    }
}