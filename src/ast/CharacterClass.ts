import { Expression, ExpressionType } from "./Expression"
import { RangeList } from "./RangeList"
import { RandomGenerator } from "../RandomGenerator"
import { CharRange } from "./CharRange"
import { RawClassMember } from "./types"
import { Character } from "./Character"
import { Sequence } from "./Sequence"

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
        return `[${this.contentToRegex()}]`
    }

    protected contentToRegex(): string {
        return this.ranges
            .map(range => {
                const lower = this.escapeChar(String.fromCharCode(range.lower))
                const upper = this.escapeChar(String.fromCharCode(range.upper))

                if (range.lower === range.upper) {
                    return lower
                } else {
                    return lower + "-" + upper
                }
            })
            .join("")
    }

    escapeChar(char: string) {
        if ("[]^\\-".includes(char)) {
            return `\\${char}`
        } else {
            return char
        }
    }

    toDSL(indentLevel: number): string {
        const operator = this.inverted ? "any except of" : "any of"
        return [
            this.indent(operator, indentLevel),
            ...this.ranges.map(range => this.indent(range.toDSL(), indentLevel + 1)),
            this.indent("end", indentLevel),
        ].join("\n")
    }

    private static charMembersFromExpression(expr: Expression): CharRange[] {
        if (expr instanceof CharacterClass) {
            return expr.getRawRanges()
        } else if (expr instanceof Character) {
            return [CharRange.fromChar(expr.value)]
        } else if (expr instanceof Sequence) {
            return expr.children.flatMap(CharacterClass.charMembersFromExpression)
        }

        console.log(`Error: could not extract character ranges from ${expr.toString()}`)
        return []
    }

    private static convertToCharRanges(members: RawClassMember[]): CharRange[] {
        const ranges: CharRange[] = []

        for (let member of members) {
            if (typeof member === "string") {
                ranges.push(CharRange.fromStrings(member, member))
            } else if (member instanceof Expression) {
                ranges.push(...CharacterClass.charMembersFromExpression(member))
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
