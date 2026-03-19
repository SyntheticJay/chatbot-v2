import {BaseModule} from "../BaseModule";
import ChatbotClient from "../../Client";
import {Entity} from "prismarine-entity";
import {Movement} from "mineflayer-movement";
import {Vec3} from "vec3";

export default class AutoAttack extends BaseModule {
    /**
     * Timestamp of the last message sent by the bot to prevent spamming
     *
     * @private
     */
    private lastMessageTime: number = 0;
    /**
     * Cooldown period (in milliseconds) between messages sent by the bot to prevent spamming
     *
     * @private
     */
    private readonly messageCooldown: number = 5000;
    /**
     * Maximum distance to track and interact with players
     *
     * @private
     */
    private readonly trackingRange: number = 5;
    /**
     * The distance at which the bot will attempt to attack the player
     *
     * @private
     */
    private readonly attackRange: number = 2;
    /**
     * The messages the bot will randomly choose from when attacking a player
     *
     * @private
     */
    private readonly messages: string[] = [
        "come here you little bitch",
        "fuck you man",
    ];

    constructor(client: ChatbotClient) {
        super(client, {
            name: "autoattack",
            description: "Automatically attacks nearby players."
        });
    }

    async onPhysicsTick() {
        const entity = this.client.bot.nearestEntity((entity: Entity) => this.isValidPlayer(entity));

        const movement: Movement = this.client.bot.movement;

        if (entity) {
            this.setMovementStates(true);

            movement.heuristic.get("proximity").target(entity.position);

            const yaw: number = movement.getYaw(240, 15, 1);

            await movement.steer(yaw);

            const botPos: Vec3 = this.client.bot.entity.position;
            const entityPos: Vec3 = entity.position;

            if (botPos.distanceTo(entityPos) < this.attackRange) {
                this.client.bot.attack(entity);

                const currentTime: number = Date.now();

                if (currentTime - this.lastMessageTime > this.messageCooldown) {
                    this.lastMessageTime = currentTime;

                    const randomMessageIndex: number = Math.floor(Math.random() * this.messages.length);
                    let message: string = this.messages[randomMessageIndex];

                    this.client.bot.chat(message);
                }
            }
        } else this.setMovementStates(false);
    }

    /**
     * Disable movement states when the module is disabled to prevent the bot from getting stuck in a movement state
     *
     * @return {void}
     */
    async onDisable(): Promise<void> {
        console.log('disabling autoattack module, resetting movement states');
        this.setMovementStates(false);
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