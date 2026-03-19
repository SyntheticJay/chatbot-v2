import ChatbotClient from "../Client";

interface ModuleInfo {
    name: string;
    description: string;
}

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

            this.onEnable().catch(error => {
                console.error(`Error enabling module "${this.info.name}":`, error);
                this.#enabled = false;
            });
        } else {
            this.#enabled = false;

            this.onDisable().catch(error => {
                console.error(`Error disabling module "${this.info.name}":`, error);
            });
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
    /**
     * Fired on every physics tick.
     *
     * @return {Promise<void>}
     */
    async onPhysicsTick(): Promise<void> {}
}