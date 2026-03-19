import {BaseEvent} from "../BaseEvent";
import ChatbotClient from "../../Client";
import BaseCommand, {CommandContext} from "../../command/BaseCommand";
import {Collection} from "@discordjs/collection";

export default class ChatEvent extends BaseEvent {
    /**
     * Cooldown collection to track command usage and prevent spamming.
     * Cooldowns are on the command level.
     *
     * Username -> Command Name -> Timestamp
     *
     * @private
     */
    #cooldown: Collection<string, Collection<string, number>> = new Collection();

    /**
     * Cooldown duration (in milliseconds) for commands to prevent spamming.
     *
     * @private
     */
    #cooldownDuration: number = 5000;

    /**
     * Construct a new ChatEvent
     *
     * @param client
     */
    constructor(client: ChatbotClient) {
        super(client, "chat", false);
    }

    /**
     * Execute the event.
     *
     * @param username
     * @param message
     */
    execute(username: string, message: string) {
        if (username === this.client.bot.username) return; // Ignore messages from the bot itself

        if (message.startsWith(BaseCommand.prefix)) {
            this.handleCommand(username, message);
        }
    }

    /**
     * Handle a command.
     *
     * @param username
     * @param message
     */
    handleCommand(username: string, message: string) {
        const args: string[] = message.slice(BaseCommand.prefix.length).trim().split(/ +/);

        const commandName: string = args.shift()!.toLowerCase();

        const command = this.client.commands.get(commandName) ||
            this.client.commands.find(cmd => cmd.info.aliases && cmd.info.aliases.includes(commandName));

        if (!command) return;

        const cooldownNumber = command.info.cooldown || 0;

        if (cooldownNumber > 0) {
            const userCooldown = this.#cooldown.get(username) || new Collection();

            const commandCooldown = userCooldown.get(commandName) || 0;

            if (Date.now() - commandCooldown < cooldownNumber) {
                this.client.bot.chat(`Please wait ${Math.ceil((cooldownNumber - (Date.now() - commandCooldown)) / 1000)} seconds before using that command again.`);
                return;
            }

            userCooldown.set(commandName, Date.now());
            this.#cooldown.set(username, userCooldown);
        }

        try {
            const context: CommandContext = {
                args,
                raw: message,
                executor: username,
            };

            if (command.info.usage && args.length === 0) {
                this.client.bot.chat(`Usage: ${BaseCommand.prefix}${command.info.name} ${command.info.usage}`);

                return;
            }

            command.execute(context);
        } catch (error) {
            const errorText: string = error instanceof Error ? error.stack || error.message : String(error);
            this.client.logger.error(`Error executing command ${commandName}: ${errorText}`);
            this.client.bot.chat('Something went wrong while executing that command. This has been logged.');
        }
    }
}