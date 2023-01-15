import { CharacterClass } from "./CharacterClass"
import { CharRange } from "./CharRange"

export class Whitespace extends CharacterClass {
    constructor() {
        super([CharRange.fromChar(" ")], false, true)
    }

    toString(): string {
        return "whitespace()"
    }

    toDSL(indentLevel: number): string {
        return this.indent("SPACE", indentLevel)
    }
}
