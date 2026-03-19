import BaseCommand, {CommandContext} from "../BaseCommand";
import ChatbotClient from "../../Client";

export default class PingCommand extends BaseCommand {
    /**
     * Construct a new PingCommand
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, {
            name: "ping",
            description: "A test command",
            usage: "ping",
        });
    }

    /**
     * Execute the command.
     *
     * @param context
     */
    execute(context: CommandContext) {
        this.client.bot.chat('Hi, ' + context.executor + "!");
        this.client.bot.chat("Arguments received: " + context.args.join(", "));
    }
}