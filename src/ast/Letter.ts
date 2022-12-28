import { CharacterClass } from "./CharacterClass"
import { Language } from "./Language"

export class Letter extends CharacterClass {
    constructor(language: Language = "EN") {
        let members: string[] = []
        let ranges: [string, string][] = [
            ["a", "z"],
            ["A", "Z"],
        ]

        switch (language) {
            case "EN":
                break
            case "DE":
                members = [...members, "ß", "ü", "ö", "ä", "Ü", "Ö", "Ä"]
                break
            default:
                throw new Error(`unknown language ${language}`)
        }

        super(members, ranges)
    }
}
