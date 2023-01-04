import { CharacterClass } from "./CharacterClass"
import { CharRange } from "./CharRange"
import { Language } from "./Language"

export class Letter extends CharacterClass {
    constructor(private language: Language = "EN") {
        let ranges: CharRange[] = [CharRange.fromStrings("a", "z"), CharRange.fromStrings("A", "Z")]

        switch (language) {
            case "EN":
                break
            case "DE":
                ranges = [
                    ...ranges,
                    ...["ß", "ü", "ö", "ä", "Ü", "Ö", "Ä"].map(char => CharRange.fromChar(char)),
                ]
                break
            default:
                throw new Error(`unknown language ${language}`)
        }

        super(ranges, false, true)
    }

    toDSL(indentLevel: number): string {
        return this.indent(`LETTER.${this.language}`, indentLevel)
    }
}
