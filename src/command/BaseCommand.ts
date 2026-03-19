import ChatbotClient from "../Client";

export interface CommandContext {
    args: string[];
    raw: string;
    executor: string;
}

export interface CommandInfo {
    name: string;
    description: string;
    usage?: string;
    aliases?: string[] | undefined;
    cooldown?: number | undefined;
}

export default abstract class BaseCommand {
    /**
     * The command prefix.
     *
     * @type {string}
     */
    public static readonly prefix: string = "!";
    /**
     * The client.
     *
     * @private
     */
    readonly #client: ChatbotClient;
    /**
     * Command information
     *
     * @private
     */
    readonly #info: CommandInfo;

    /**
     * Construct a new Command
     *
     * @param client
     * @param info
     */
    protected constructor(client: ChatbotClient, info: CommandInfo) {
        this.#client = client;
        this.#info = info;
    }

    /**
     * Get the client.
     *
     * @return {ChatbotClient}
     */
    get client(): ChatbotClient {
        return this.#client;
    }

    /**
     * Get the command information.
     *
     * @return {CommandInfo}
     */
    get info(): CommandInfo {
        return this.#info;
    }

    /**
     * Execute the command.
     *
     * @param context
     */
    public abstract execute(context: CommandContext): void;
}