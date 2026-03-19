import Value from "./Value";

export default class BooleanValue extends Value<boolean> {
    /**
     * Construct a new boolean value.
     *
     * @param name
     * @param label
     * @param description
     * @param defaultValue
     */
    constructor(name: string, label: string, description: string, defaultValue: boolean) {
        super(name, label, description, defaultValue, (value) => typeof value === "boolean");
    }
}