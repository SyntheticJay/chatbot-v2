import { createBot, Bot, BotEvents } from "mineflayer";
import { plugin as movementPlugin } from "mineflayer-movement";
import { BotConfiguration, configuration } from "./Config";
import { Collection } from "@discordjs/collection";
import { BaseEvent } from "./events/BaseEvent";
import { Glob } from "bun";
import { join } from "path";
import { Logger } from "pino";
import BaseCommand from "./command/BaseCommand";
import {BaseModule} from "./module/BaseModule";

export default class ChatbotClient {
    /**
     * The logger instance for the bot, used for logging information and errors.
     *
     * @private
     */
    readonly #logger: Logger;
    /**
     * A collection to store the bot's events, keyed by their name.
     *
     * @private
     */
    #events: Collection<string, BaseEvent> = new Collection();
    /**
     * A collection to store the bot's commands, keyed by their name.
     *
     * @private
     */
    #commands: Collection<string, BaseCommand> = new Collection();
    /**
     * A collection to store the bot's modules, keyed by their name.
     *
     * @private
     */
    #modules: Collection<string, BaseModule> = new Collection();
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
     * Load the commands.
     *
     * @return {Promise<void>}
     */
    async loadCommands(): Promise<void> {
        const glob = new Glob(join(__dirname, "command/impl", "**", "*.ts"));

        for await (const file of glob.scan()) {
            const { default: CommandClass } = await import(file);

            const commandInstance: BaseCommand = new CommandClass(this);

            this.#commands.set(commandInstance.info.name, commandInstance);

            this.#logger.info(`Registered command: ${commandInstance.info.name}`);
        }
    }

    /**
     * Load the modules.
     *
     * @return {Promise<void>}
     */
    async loadModules(): Promise<void> {
        const glob = new Glob(join(__dirname, "module/impl", "**", "*.ts"));

        for await (const file of glob.scan()) {
            const { default: ModuleClass } = await import(file);

            const moduleInstance: BaseModule = new ModuleClass(this);

            this.#modules.set(moduleInstance.info.name, moduleInstance);

            this.#logger.info(`Registered module: ${moduleInstance.info.name}`);
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

        await this.loadModules();
        await this.loadCommands();
        await this.loadEvents();
    }

    /**
     * Restart the bot by stopping the current instance and starting a new one.
     *
     * @return {Promise<void>}
     */
    async restart(): Promise<void> {
        if (!this.#bot) {
            throw new Error("Bot instance is not initialized. Cannot restart.");
        }

        this.#bot.end();
        this.#bot = null;
        await this.start();
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
     * Get the collection of commands registered with the bot.
     *
     * @return {Collection<string, BaseCommand>}
     */
    get commands(): Collection<string, BaseCommand> {
        return this.#commands;
    }

    /**
     * Get the collection of modules registered with the bot.
     *
     * @return {Collection<string, BaseModule>}
     */
    get modules(): Collection<string, BaseModule> {
        return this.#modules;
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