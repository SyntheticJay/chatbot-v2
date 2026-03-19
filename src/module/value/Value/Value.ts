
export default class Value<T> {
    /**
     * The name of the value.
     *
     * @private
     */
    readonly #name: string;
    /**
     * The label of the value, which is the same as the name by default but can be overridden in subclasses if needed.
     *
     * @private
     */
    readonly #label: string;
    /**
     * The description of the value.
     *
     * @private
     */
    readonly #description: string;
    /**
     * The current value.
     *
     * @private
     */
    #value: T;
    /**
     * The default value, used for resetting the value to its original state.
     *
     * @private
     */
    readonly #defaultValue: T;
    /**
     * An optional validator function that checks if a new value is valid before setting it.
     *
     * @private
     */
    readonly #validator?: (value: T) => boolean;

    /**
     * Construct a new value.
     *
     * @param name
     * @param label
     * @param description
     * @param defaultValue
     * @param validator
     */
    constructor(
        name: string,
        label: string,
        description: string,
        defaultValue: T,
        validator?: (value: T) => boolean
    ) {
        this.#name = name;
        this.#label = label;
        this.#description = description;
        this.#value = defaultValue;
        this.#defaultValue = defaultValue;
        this.#validator = validator;
    }

    /**
     * Get the name of the value.
     *
     * @return {string}
     */
    get name(): string {
        return this.#name;
    }

    /**
     * Get the label of the value, which is the same as the name by default but can be overridden in subclasses if needed.
     *
     * @return {string}
     */
    get label(): string {
        return this.label;
    }

    /**
     * Get the description of the value.
     *
     * @return {string}
     */
    get description(): string {
        return this.#description;
    }

    /**
     * Get the current value.
     * @return {T}
     */
    get value(): T {
        return this.#value;
    }

    /**
     * Get the default value.
     *
     * @return {T}
     */
    get defaultValue(): T {
        return this.#defaultValue;
    }

    /**
     * Set a new value, validating it if a validator function is provided.
     *
     * @param newValue
     * @return {boolean} True if the value was successfully set, false if validation failed.
     * @throws {Error} If the new value is invalid according to the validator function.
     */
    setValue(newValue: T): boolean {
        if (this.#validator && !this.#validator(newValue)) {
            throw new Error(`Invalid value for "${this.name}": ${newValue}`);
        }

        this.#value = newValue;
        return true;
    }

    /**
     * Reset the value to its default state.
     */
    reset(): void {
        this.#value = this.#defaultValue;
    }

    /**
     * Serialize the value for storage or transmission. By default, this returns the current value,
     *
     * but it can be overridden in subclasses to provide custom serialization logic if needed.
     *
     * @return {any}
     */
    serialize(): any {
        return this.#value;
    }

    /**
     * Deserialize a value from stored or transmitted data. By default, this simply returns the input data,
     *
     * but it can be overridden in subclasses to provide custom deserialization logic if needed.
     *
     * @param data
     *
     * @return {T}
     */
    static deserialize<T>(data: any): T {
        return data as T;
    }
}