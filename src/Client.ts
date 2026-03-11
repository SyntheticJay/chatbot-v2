import { createBot, Bot, BotEvents } from "mineflayer";
import { plugin as movementPlugin } from "mineflayer-movement";
import { BotConfiguration, configuration } from "./Config";
import { Collection } from "@discordjs/collection";
import { BaseEvent } from "./events/BaseEvent";
import { Glob } from "bun";
import { join } from "path";
import { Logger } from "pino";

export default class ChatbotClient {
    /**
     * The logger instance for the bot, used for logging information and errors.
     *
     * @private
     */
    #logger: Logger;
    /**
     * A collection to store the bot's events, keyed by their name.
     *
     * @private
     */
    #events: Collection<string, BaseEvent> = new Collection();
    /**
     * The bot's configuration, loaded from the Config module.
     *
     * @private
     */
    readonly #config: BotConfiguration;
    /**
     * The Mineflayer bot instance. This will be initialized when the start method is called.
     *
     * @private
     */
    #bot: Bot | null = null;

    /**
     * Construct a new ChatbotClient instance
     */
    constructor(logger: Logger) {
        this.#logger = logger;
        this.#config = configuration;
    }

    /**
     * Load all event files from the events directory and register them in the event's collection.
     *
     * @return {Promise<void>}
     */
    async loadEvents(): Promise<void> {
        if (!this.#bot) {
            throw new Error("Bot instance is not initialized. Cannot register event.");
        }

        const glob = new Glob(join(__dirname, "events/impl", "**", "*.ts"));

        for await (const file of glob.scan()) {
            const { default: EventClass } = await import(file);

            const eventInstance: BaseEvent = new EventClass(this);

            this.#events.set(eventInstance.name, eventInstance);

            const eventName = eventInstance.name as keyof BotEvents;

            if (eventInstance.once) {
                this.#bot.once(eventName, (...args: any) => eventInstance.execute(...args));
            } else {
                this.#bot.on(eventName, (...args: any) => eventInstance.execute(...args));
            }

            this.#logger.info(`Registered event: ${eventInstance.name}`);
        }
    }

    /**
     * Start the bot by creating a Mineflayer instance with the provided configuration and loading events.
     *
     * @return {Promise<void>}
     */
    async start(): Promise<void> {
        this.#bot = createBot({
            host: this.#config.host,
            port: this.#config.port,
            username: this.#config.auth.username,
            auth: this.#config.auth.type,
        });

        this.#bot.loadPlugin(movementPlugin);

        await this.loadEvents();
    }

    /**
     * Get the Mineflayer bot instance. This will throw an error if the bot has not been initialized yet.
     *
     * @return {Bot}
     */
    get bot(): Bot {
        if (!this.#bot) {
            throw new Error("Bot has not been initialized yet.");
        }

        return this.#bot;
    }

    /**
     * Get the collection of events registered with the bot.
     *
     * @return {Collection<string, BaseEvent>}
     */
    get events(): Collection<string, BaseEvent> {
        return this.#events;
    }

    /**
     * Get the bot's configuration.
     *
     * @return {BotConfiguration}
     */
    get config(): BotConfiguration {
        return this.#config;
    }

    /**
     * Get the logger instance for the bot.
     *
     * @return {Logger}
     */
    get logger(): Logger {
        return this.#logger;
    }
}