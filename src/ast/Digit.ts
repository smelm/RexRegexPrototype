import { CharacterClass } from "./CharacterClass"
import { CharRange } from "./CharRange"

export class Digit extends CharacterClass {
    constructor() {
        super([CharRange.fromStrings("0", "9")], false, true)
    }

    toString(): string {
        return "DIGIT"
    }

    toDSL(indentLevel: number): string {
        return this.indent("DIGIT", indentLevel)
    }
}
