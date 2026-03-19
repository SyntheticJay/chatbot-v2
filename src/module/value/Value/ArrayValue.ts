import Value from "./Value";

export default class ArrayValue<T> extends Value<T[]> {
    /**
     * Construct a new array value.
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
        defaultValue: T[],
        validator?: (value: T[]) => boolean
    ) {
        super(name, label, description, defaultValue, (value) => {
            if (!Array.isArray(value)) return false;
            if (validator) return validator(value);
            return true;
        });
     }

    /**
     * Serialize the array value for storage or transmission.
     *
     * @return {any}
     */
    serialize(): any {
        return this.value;
    }

    /**
     * Deserialize the raw value back into an array. This method assumes that the raw value is already an array and does not perform any additional validation or transformation.
     *
     * @param raw
     */
    deserialize(raw: any): T[] {
        if (!Array.isArray(raw)) throw new Error(`Expected array for value "${this.name}"`);
        return raw as T[];
    }
}