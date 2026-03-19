import BaseCommand, {CommandContext} from "../BaseCommand";
import ChatbotClient from "../../Client";

export default class ToggleModuleCommand extends BaseCommand {
    constructor(client: ChatbotClient) {
        super(client, {
            name: "togglemodule",
            description: "Toggle a module on or off.",
            usage: "<module name>",
            aliases: ["tm"]
        });
    }

     execute(context: CommandContext): void {
        const { args } = context;

        const moduleName = args[0].toLowerCase();

        const module = this.client.modules.get(moduleName);

        if (!module) {
            this.client.bot.chat(`Module "${moduleName}" not found.`);

            return;
        }

        module.toggle();

        const status = module.enabled ? "enabled" : "disabled";

        this.client.bot.chat(`Module "${module.info.name}" has been ${status}.`);
    }
}