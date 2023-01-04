import { CharacterClass } from "./CharacterClass"

export type RawCharRange = [string, string]
export type RawClassMember = string | RawCharRange | CharacterClass
