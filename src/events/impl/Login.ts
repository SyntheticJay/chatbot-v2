import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";

export default class LoginEvent extends BaseEvent {
    /**
     * Construct a new LoginEvent
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, "login", false);
    }

    /**
     * Execute the event.
     *
     * @return void
     */
    execute(): void {
        const { Default } = this.client.bot.movement.goals;

        this.client.bot.movement.setGoal(Default);
    }
}