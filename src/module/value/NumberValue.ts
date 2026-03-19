import Value from "./Value";

export default class NumberValue extends Value<number> {
    readonly #min: number;
    readonly #max: number;

    constructor(name: string, label: string, description: string, defaultValue: number, min: number, max: number) {
        super(name, label, description, defaultValue, (value) => {
            if (isNaN(value)) return false;
            if (value < min) return false;
            return value <= max;
        });

        this.#min = min;
        this.#max = max;
    }

    get min(): number {
        return this.#min;
    }

    get max(): number {
        return this.#max;
    }
}