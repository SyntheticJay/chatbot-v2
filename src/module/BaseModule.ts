import ChatbotClient from "../Client";
import {BotEvents} from "mineflayer";
import {Collection} from "@discordjs/collection";
import Value from "./value/Value";
import * as path from "node:path";
import * as fs from "node:fs";

interface ModuleInfo {
    name: string;
    description: string;
}

type ListenerEntry = {
    event: keyof BotEvents;
    handler: (...args: any[]) => void | Promise<void>;
};

export class BaseModule {
    /**
     * The chatbot client instance.
     *
     * @private
     */
    readonly #client: ChatbotClient;
    /**
     * The module's information
     * @private
     */
    readonly #info: ModuleInfo;
    /**
     * Indicates whether the module is enabled.
     *
     * @private
     */
    #enabled: boolean;
    /**
     * Registered event listeners for this module, used for cleanup when disabling the module.
     *
     * @private
     */
    #listeners: ListenerEntry[] = [];
    /**
     * A collection of values associated with this module, allowing for easy retrieval and management of module-specific data.
     *
     * @private
     */
    #values: Collection<string, Value<any>> = new Collection();

    /**
     * Construct a new module.
     *
     * @param client
     * @param info
     *
     * @protected
     */
    protected constructor(client: ChatbotClient, info: ModuleInfo) {
        this.#client = client;
        this.#info = info;
        this.#enabled = false;
    }

    /**
     * Register an event listener for the bot. The listener will be automatically removed when the module is disabled.
     *
     * @param event
     * @param handler
     * @protected
     */
    protected listen<K extends keyof BotEvents>(
        event: K,
        handler: BotEvents[K] extends (...args: infer A) => any
            ? (...args: A) => void | Promise<void>
            : never
    ): void {
        this.#listeners.push({ event, handler: handler as (...args: any[]) => void | Promise<void> });
    }

    /**
     * Get the chatbot client instance.
     *
     * @return {ChatbotClient}
     */
    get client(): ChatbotClient {
        return this.#client;
    }

    /**
     * Get the module's information, including its name and description.
     *
     * @return {ModuleInfo}
     */
    get info(): ModuleInfo {
        return this.#info;
    }

    /**
     * Check if the module is currently enabled.
     *
     * @return {boolean}
     */
    get enabled(): boolean {
        return this.#enabled;
    }

    /**
     * Get the collection of values associated with this module, allowing for easy retrieval and management of module-specific data.
     *
     * @return {Collection<string, Value<any>>}
     */
    get values(): Collection<string, Value<any>> {
        return this.#values;
    }

    /**
     * Register a value for this module.
     */
    protected registerValue<T>(value: Value<T>): Value<T> {
        this.#values.set(value.name, value);
        return value;
    }

    /**
     * Get the file path where the module's values are saved. This is used for persisting module-specific data across sessions.
     *
     * @private
     */
    get #savePath(): string {
        return path.join(
            "data",
            "modules",
            this.info.name + ".json",
        );
    }

    /**
     * Save the values to a file for persistence.
     *
     * @return {Promise<void>}
     */
    async saveValues(): Promise<void> {
        const data: Record<string, any> = {};

        for (const [key, value] of this.values) {
            data[key] = value.value;
        }

        await fs.promises.mkdir(path.dirname(this.#savePath), { recursive: true });
        await fs.promises.writeFile(this.#savePath, JSON.stringify(data, null, 2), "utf-8");
    }

    /**
     * Load the values into the module.
     *
     * @return {Promise<void>}
     */
    async loadValues(): Promise<void> {
        try {
            const data = await fs.promises.readFile(this.#savePath, "utf-8");
            const parsed: Record<string, any> = JSON.parse(data);

            for (const [key, value] of Object.entries(parsed)) {
                const existingValue = this.values.get(key);

                if (existingValue) {
                    existingValue.setValue(value);
                } else {
                    console.warn(`Value "${key}" not found in module "${this.info.name}" while loading values. Skipping.`);
                }
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                console.error(`Error loading values for module "${this.info.name}":`, error);
            }
        }
    }

    /**
     * Set the module's enabled state.
     *
     * @param newState
     */
    setModuleState(newState: boolean) {
        if (newState) {
            this.#enabled = true;
            this.#registerListeners();

            this.loadValues()
                .then(() => this.onEnable())
                .catch(error => {
                    console.error(`Error enabling module "${this.info.name}":`, error);
                    this.setModuleState(false);
                });
        } else {
            this.#enabled = false;
            this.#cleanupListeners();

            this.saveValues()
                .then(() => this.onDisable())
                .catch(error => {
                    console.error(`Error disabling module "${this.info.name}":`, error);
                });
        }
    }

    /**
     * Register event listeners for the module. This method is called when the module is enabled.qq
     *
     * @private
     */
    #registerListeners() {
        for (const { event, handler } of this.#listeners) {
            this.client.bot.on(event, handler);
        }
    }

    /**
     * Remove all event listeners registered by this module. This method is called when the module is disabled to prevent memory leaks and unintended behavior.
     *
     * @private
     */
    #cleanupListeners() {
        for (const { event, handler } of this.#listeners) {
            this.client.bot.off(event, handler);
        }
    }

    /**
     * Toggle the module on or off.
     *
     * @return {void}
     */
    toggle(): void {
        this.setModuleState(!this.enabled);
    }

    /**
     * Fired when the module is enabled.
     *
     * @return {Promise<void>}
     */
    async onEnable(): Promise<void> {}
    /**
     * Fired when the module is disabled.
     *
     * @return {Promise<void>}
     */
    async onDisable(): Promise<void> {}
}