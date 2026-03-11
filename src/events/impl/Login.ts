import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";

export default class LoginEvent extends BaseEvent {
    constructor(client: ChatbotClient) {
        super(client, "login", false);
    }

    execute(): void {
        const { Default } = this.client.bot.movement.goals;
        this.client.bot.movement.setGoal(Default);
    }
}