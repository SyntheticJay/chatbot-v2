import { BaseEvent } from "../BaseEvent";
import { Movement } from "mineflayer-movement";
import { Vec3 } from "vec3";
import { Entity } from "prismarine-entity";
import ChatbotClient from "../../Client";

export default class PhysicsTickEvent extends BaseEvent {
    /**
     * Construct a new PhysicsTick event.
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, "physicsTick", false);
    }

    /**
     * Execute the event.
     *
     * @return {Promise<void>}
     */
    async execute(): Promise<void> {
        const enabledModules = this.client.modules.filter(module => module.enabled);

        for (const module of enabledModules.values()) {
            await module.onPhysicsTick();
        }
    }
}