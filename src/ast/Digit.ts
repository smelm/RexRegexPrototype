import { CharacterClass } from "./CharacterClass"

export class Digit extends CharacterClass {
    constructor() {
        super([], [["0", "9"]])
    }

    toString(): string {
        return "DIGIT"
    }
}
