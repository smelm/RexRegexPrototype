import { Expression, ExpressionType } from "./Expression"
import { RangeList } from "./RangeList"
import { RandomGenerator } from "../RandomGenerator"
import { CharRange } from "./CharRange"
import { RawClassMember } from "./types"

export class CharacterClass extends Expression {
    public readonly ranges: RangeList

    constructor(
        ranges: CharRange[],
        public readonly inverted: boolean = false,
        public readonly isPredefined: boolean = false,
        private readonly numSamplesToGenerate: number = 5
    ) {
        super(ExpressionType.CHARACTER_CLASS)

        this.ranges = new RangeList(ranges)

        if (this.numSamplesToGenerate > this.ranges.size()) {
            this.numSamplesToGenerate = this.ranges.size()
        }
    }

    toString(): string {
        const rangesString = this.ranges.map(r => r.toString()).join(", ")
        return `anyOf(${rangesString})`
    }

    generateValid(_tree: Expression, rng: RandomGenerator): string[] {
        return this.ranges.sample(this.numSamplesToGenerate, rng)
    }

    generateInvalid(_tree: Expression, rng: RandomGenerator): string[] {
        return this.ranges.invert().sample(this.numSamplesToGenerate, rng)
    }

    toRegex(): string {
        return `[${this.ranges
            .map(range =>
                range.lower === range.upper
                    ? String.fromCharCode(range.lower)
                    : String.fromCharCode(range.lower) + "-" + String.fromCharCode(range.upper)
            )
            .join("")}]`
    }

    toDSL(indentLevel: number): string {
        const indent = " ".repeat(4 * indentLevel)
        return `${indent}any{this.inverted? " except" : ""} of\n${this.ranges
            .map(range => range.toDSL())
            .join("\n" + indent + "    ")}`
    }

    static convertToCharRanges(members: RawClassMember[]): CharRange[] {
        const ranges: CharRange[] = []

        for (let member of members) {
            if (typeof member === "string") {
                ranges.push(CharRange.fromStrings(member, member))
            } else if (member instanceof CharacterClass) {
                ranges.push(...member.getRawRanges())
            } else {
                ranges.push(CharRange.fromStrings(...member))
            }
        }

        return ranges
    }

    static fromMemberList(members: RawClassMember[]): CharacterClass {
        const ranges = CharacterClass.convertToCharRanges(members)
        return new CharacterClass(ranges)
    }

    getRawRanges(): CharRange[] {
        return this.ranges.getRanges()
    }

    exceptOf(...members: RawClassMember[]): CharacterClass {
        const classToRemove = CharacterClass.fromMemberList(members)
        return new CharacterClass(this.ranges.remove(classToRemove.ranges).ranges)
    }
}
