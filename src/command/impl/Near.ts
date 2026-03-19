import BaseCommand, {CommandContext} from "../BaseCommand";
import ChatbotClient from "../../Client";
import {Entity} from "prismarine-entity";
import {Vec3} from "vec3";

export default class NearCommand extends BaseCommand {
    /**
     * The default radius threshold for nearby players if no radius is provided.
     *
     * @private
     */
    #radiusThreshold: number = 16;

    /**
     * Construct a new NearCommand
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, {
            name: "near",
            description: "List nearby players within a specified radius",
            usage: "<radius>"
        });
    }

    /**
     * Execute the command.
     *
     * @param context
     */
    execute(context: CommandContext): void {
        const radius = parseFloat(context.args[0]);

        if (isNaN(radius) || radius <= 0) {
            this.client.bot.chat("Please provide a valid radius (positive number).");

            return;
        }

        if (radius > this.#radiusThreshold) {
            this.client.bot.chat(`Radius exceeds the threshold of ${this.#radiusThreshold} blocks. Please provide a smaller radius.`);

            return;
        }

        const botPos = this.client.bot.entity.position;
        const entities = Object.values(this.client.bot.entities).filter(entity => this.isValidPlayer(entity, botPos, radius));

        if (entities.length === 0) {
            this.client.bot.chat(`No players found within a radius of ${radius} blocks.`);

            return;
        }

        const playerNames = entities.map(entity => entity.username).join(", ");

        this.client.bot.chat(`Players within a radius of ${radius} blocks: ${playerNames}`);
    }

    /**
     * Determine if an entity is a valid player within the specified radius.
     *
     * @param entity
     * @param botPos
     *
     * @param radius
     */
    isValidPlayer(entity: Entity, botPos: Vec3, radius: number): boolean {
        return entity.type === "player"
            && entity.username !== this.client.bot.username
            && entity.position.distanceTo(botPos) <= radius;
    }
}