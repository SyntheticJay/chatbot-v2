import {BaseModule} from "../BaseModule";
import ChatbotClient from "../../Client";
import {Entity} from "prismarine-entity";
import {Movement} from "mineflayer-movement";
import {Vec3} from "vec3";
import NumberValue from "../value/NumberValue";
import Value from "../value/Value";

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
    #messageCooldown: Value<number>;
    /**
     * Maximum distance to track and interact with players
     *
     * @private
     */
    readonly #trackingRange: Value<number>;
    /**
     * The distance at which the bot will attempt to attack the player
     *
     * @private
     */
    readonly #attackRange: Value<number>;
    /**
     * The messages the bot will randomly choose from when attacking a player
     *
     * @private
     */
    readonly #messages: Value<string[]>;

    constructor(client: ChatbotClient) {
        super(client, {
            name: "autoattack",
            description: "Automatically attacks nearby players."
        });

        this.listen("physicsTick", () => this.onPhysicsTick());

        this.#messageCooldown = this.registerValue(new NumberValue("message_cooldown",  "Message Cooldown","The cooldown between each message", 5000, 0, 10000));
        this.#trackingRange = this.registerValue(new NumberValue("tracking_range",  "Tracking Range","The distance to track players", 16, 1, 16));
        this.#attackRange = this.registerValue(new NumberValue("attack_range",  "Attack Range","The distance to start attacking players", 3, 0, 5));
        this.#messages = this.registerValue(new Value<string[]>("messages", "Attack Messages", "The messages the bot will randomly choose from when attacking a player", ["Got you %username%!", "You're no match for me!", "Is that all you've got?", "You can't hide from me!", "Prepare to be attacked!"]));
    }

    /**
     * On physics tick
     *
     * @return {Promise<void>}
     */
    async onPhysicsTick(): Promise<void> {
        const nearestEntity = this.client.bot.nearestEntity((entity: Entity) => this.isValidPlayer(entity));

        const movement: Movement = this.client.bot.movement;

        if (nearestEntity) {
            this.setMovementStates(true);

            movement.heuristic.get("proximity").target(nearestEntity.position);

            const yaw: number = movement.getYaw(240, 15, 1);

            await movement.steer(yaw);

            const botPos: Vec3 = this.client.bot.entity.position;
            const entityPos: Vec3 = nearestEntity.position;

            if (botPos.distanceTo(entityPos) < this.#attackRange.value) {
                this.client.bot.attack(nearestEntity);

                const currentTime: number = Date.now();

                if (currentTime - this.lastMessageTime > this.#messageCooldown.value) {
                    this.lastMessageTime = currentTime;

                    const randomMessageIndex: number = Math.floor(Math.random() * this.#messages.value.length);

                    let message: string = this.#messages.value[randomMessageIndex];

                    if (nearestEntity.username != null) {
                        message = message.replace("%username%", nearestEntity.username);
                    }

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
            entity.position.distanceTo(this.client.bot.entity.position) < this.#trackingRange.value &&
            entity.username !== this.client.bot.username;
    }
}