import { BaseEvent } from "../BaseEvent";
import { Movement } from "mineflayer-movement";
import { Vec3 } from "vec3";
import { Entity } from "prismarine-entity";
import ChatbotClient from "../../Client";

export default class PhysicsTickEvent extends BaseEvent {
    private lastMessageTime: number = 0;
    private readonly messageCooldown: number = 5000;
    private readonly trackingRange: number = 5;
    private readonly messages: string[] = [
        "come here you little bitch",
        "fuck you man",
    ];

    constructor(client: ChatbotClient) {
        super(client, "physicsTick", false);
    }

    async execute(): Promise<void> {
       const entity = this.client.bot.nearestEntity((entity: Entity) => this.isValidPlayer(entity));

       const movement: Movement = this.client.bot.movement;

       if (entity) {
           this.setMovementStates(true);

           movement.heuristic.get("proximity").target(entity.position);

           const yaw: number = movement.getYaw(240, 15, 1);

           await movement.steer(yaw);

           const botPos: Vec3 = this.client.bot.entity.position;
           const entityPos: Vec3 = entity.position;

           if (botPos.distanceTo(entityPos) < 2) {
               this.client.bot.attack(entity);

               const currentTime: number = Date.now();

               if (currentTime - this.lastMessageTime > this.messageCooldown) {
                   this.lastMessageTime = currentTime;

                   const randomMessageIndex: number = Math.floor(Math.random() * this.messages.length);
                   const message: string = this.messages[randomMessageIndex];

                   this.client.bot.chat(message);
               }
           }
       } else this.setMovementStates(false);
    }

    /**
     * Enable or disable movement states for the bot
     *
     * @param shouldEnable
     */
    setMovementStates(shouldEnable: boolean): void {
        this.client.bot.setControlState("forward", shouldEnable);
        this.client.bot.setControlState("sprint", shouldEnable);
        this.client.bot.setControlState("jump", shouldEnable);
    }

    /**
     * Determine if the given entity is a valid player to interact with
     *
     * @param entity
     */
    isValidPlayer(entity: Entity): boolean {
        return entity.type === "player" &&
            entity.position.distanceTo(this.client.bot.entity.position) < this.trackingRange &&
            entity.username !== this.client.bot.username;
    }
}