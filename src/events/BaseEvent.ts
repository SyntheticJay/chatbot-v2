import ChatbotClient from "../Client";

export abstract class BaseEvent {
    /**
     * The bot instance
     *
     * @private
     */
    #client: ChatbotClient;
    /**
     * The name of the event
     *
     * @private
     */
    #name: string;
    /**
     * Whether this event should be registered as a one-time listener
     *
     * @private
     */
    #once: boolean;

    /**
     * Construct a new BaseEvent instance
     *
     * @param client
     * @param name
     * @param once
     * @protected
     */
    protected constructor(client: ChatbotClient, name: string, once: boolean = false) {
        this.#client = client;
        this.#name = name;
        this.#once = once;
    }

    /**
     * Get the bot instance associated with this event
     *
     * @return {ChatbotClient}
     */
    get client(): ChatbotClient {
        return this.#client;
    }

    /**
     * Get the name of the event
     *
     * @return {string}
     */
    get name(): string {
        return this.#name;
    }

    /**
     * Get whether this event should be registered as a one-time listener
     *
     * @return {boolean}
     */
    get once(): boolean {
        return this.#once;
    }

    /**
     * Execute the event's logic. This method must be implemented by subclasses to define the behavior when the event is triggered.
     *
     * @param args
     */
    abstract execute(...args: any[]): void;
}