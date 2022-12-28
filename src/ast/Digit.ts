import { CharacterClass } from "./CharacterClass"

export class Digit extends CharacterClass {
    constructor() {
        super([], [["0", "9"]], false, true)
    }

    toString(): string {
        return "DIGIT"
    }

    toDSL(indentLevel: number): string {
        return this.indent("DIGIT", indentLevel)
    }
}
