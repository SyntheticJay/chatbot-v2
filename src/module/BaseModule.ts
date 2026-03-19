import ChatbotClient from "../Client";
import {BotEvents} from "mineflayer";

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
     * Set the module's enabled state.
     *
     * @param newState
     */
    setModuleState(newState: boolean) {
        if (newState) {
            this.#enabled = true;
            this.#registerListeners();

            this.onEnable().catch(error => {
                console.error(`Error enabling module "${this.info.name}":`, error);
                this.#enabled = false;
            });
        } else {
            this.#enabled = false;
            this.#cleanupListeners();

            this.onDisable().catch(error => {
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