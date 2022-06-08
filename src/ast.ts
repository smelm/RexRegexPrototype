import { AlternativeParser, SequenceParser, spaces as _ } from "./commonParsers"
import { expressionOrBlock } from "./Expression"
import { ExpressionSequenceParser } from "./ExpressionSequence"
import { InputGenerator } from "./Generator"
import { ANY, MANY, MAYBE, OF, TO } from "./keywords"
import { LiteralParser } from "./Literal"
import { number } from "./NumberParser"
import { RandomGenerator } from "./RandomGenerator"
import shuffle from "shuffle-array"
import { RandomSeed } from "random-seed"

export enum ExpressionType {
    ANY = "any",
    REPEAT = "repeat",
    MAYBE = "maybe",
    SEQUENCE = "sequence",
    CHARACTER = "character",
}

export class Expression implements InputGenerator {
    constructor(public type: ExpressionType, public value: any) {}

    generate(valid: boolean, rng: RandomGenerator): string[] {
        throw new Error("not implemented")
    }

    toString(): string {
        return `${this.type}(${this.value.toString()})`
    }
}

// TODO support "0 to many"
// TODO support "maybe many of", or not?
export class Repeat extends Expression {
    public static parser = new AlternativeParser([
        new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
            ([expr]: Expression[]) => new Repeat(expr, 1)
        ),
        new SequenceParser([number, _, OF, expressionOrBlock]).builder(
            ([number, expr]: any[]) => new Repeat(expr, number, number)
        ),
        new SequenceParser([
            number,
            _,
            TO,
            _,
            new AlternativeParser([number, MANY]),
            _,
            OF,
            expressionOrBlock,
        ]).builder(
            ([from, to, expr]: any[]) => new Repeat(expr, from, to === "many" ? undefined : to)
        ),
    ])

    constructor(value: Expression, public lower: number, public upper?: number) {
        super(ExpressionType.REPEAT, value)
    }

    toString(): string {
        return `${this.type}(${this.lower}, ${this.upper}, ${this.value.toString()})`
    }

    /**
     * @returns the upper bound or a random number representing an upper bound of many
     */
    private generateUpper(rng: RandomGenerator): number {
        //TODO remove magic number
        return this.upper || rng.intBetween(this.lower, this.lower + 5)
    }

    private generateValid(rng: RandomGenerator): string[] {
        const childStrings: string[] = this.value.generate(true, rng)

        if (this.lower === this.upper) {
            return childStrings.map(s => s.repeat(this.lower))
        } else {
            return childStrings
                .map(s => [s.repeat(this.lower), s.repeat(this.generateUpper(rng))])
                .flat()
        }
    }

    private generateInvalid(rng: RandomGenerator): string[] {
        const validChildStr: string[] = this.value.generate(true, rng)
        const invalidChildStr: string[] = this.value.generate(false, rng)

        let result: string[] = []

        if (this.lower !== 0) {
            const validStringRepeatedTooFew = validChildStr.map(s => s.repeat(this.lower - 1))
            const invalidStringRepeatedCorrectlyLower = invalidChildStr.map(s =>
                s.repeat(this.lower)
            )

            result.push(...invalidStringRepeatedCorrectlyLower)
            result.push(...validStringRepeatedTooFew)
        }

        if (this.upper != null) {
            const validStringRepeatedTooMany = validChildStr.map(s => s.repeat(this.upper! + 1))
            result.push(...validStringRepeatedTooMany)
        }

        const invalidStringRepeatedCorrectlyUpper = invalidChildStr.map(s => s.repeat(this.upper!))
        result.push(...invalidStringRepeatedCorrectlyUpper)

        return result
    }

    generate(valid: boolean, rng: RandomGenerator): string[] {
        if (valid) {
            return this.generateValid(rng)
        } else {
            return this.generateInvalid(rng)
        }
    }
}

export class Sequence extends Expression {
    public static parser = new ExpressionSequenceParser()

    constructor(value: Expression[]) {
        super(ExpressionType.SEQUENCE, value)
    }

    toString(): string {
        return `${this.type}(${this.value.map((v: Expression) => v.toString()).join(", ")})`
    }

    private combinations(examplesPerElement: string[][]): string[] {
        const MAX_LENGTH = Math.max(...examplesPerElement.map(arr => arr.length))

        return Array(MAX_LENGTH)
            .fill(undefined)
            .map((_, i) =>
                examplesPerElement.map(examples => examples[i % examples.length]).join("")
            )
    }

    private examplesFromChildren(valid: boolean, rng: RandomGenerator): string[][] {
        return this.value.map((child: Expression) => {
            let examples = child.generate(valid, rng)
            shuffle(examples, { rng: rng.random })
            return examples
        })
    }

    private generateValid(rng: RandomGenerator): string[] {
        return this.combinations(this.examplesFromChildren(true, rng))
    }

    private generateInvalid(rng: RandomGenerator): string[] {
        const validExamples = this.examplesFromChildren(true, rng)
        const invalidExamples = this.examplesFromChildren(false, rng)

        let result: string[] = []

        invalidExamples.forEach((example, i) => {
            if (example.length === 0) {
                return
            }

            let combinations = this.combinations([
                ...validExamples.slice(0, i),
                example,
                ...validExamples.slice(i + 1),
            ])
            result = [...result, ...combinations]
        })

        return result
    }

    generate(valid: boolean, rng: RandomGenerator): string[] {
        if (valid) {
            return this.generateValid(rng)
        } else {
            return this.generateInvalid(rng)
        }
    }
}

export class Character extends Expression {
    constructor(value: string) {
        super(ExpressionType.CHARACTER, value)
    }

    toString(): string {
        return `${this.type}(${this.value})`
    }

    generate(valid: boolean, generator: RandomGenerator): string[] {
        if (valid) {
            return [this.value]
        } else {
            //TODO: this is not good
            //TODO: make this work with unicode
            //TODO: this could cause problems with greedy repetition before
            let char

            do {
                char = randomCharacter(generator)
            } while (char === this.value)
            return [char]
        }
    }
}

function randomCharacter(generator: RandomGenerator) {
    return String.fromCharCode(generator.intBetween(40, 122))
}

export function character(char: string): Character {
    return new Character(char)
}

function charSeqFromLiteral(s: string): Sequence {
    const result = []
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i)
        result.push(new Character(c))
    }
    return sequence(result)
}

export class Literal extends Expression {
    public static parser = new LiteralParser().builder(charSeqFromLiteral)
}

export class Any extends Expression {
    public static parser = ANY.builder(() => new Any())

    constructor() {
        super(ExpressionType.ANY, "any")
    }

    toString(): string {
        return this.type.toString()
    }

    //TODO: this is terrible
    //TODO: use random seed
    generate(valid: boolean, generator: RandomGenerator): string[] {
        if (valid) {
            return [randomCharacter(generator)]
        } else {
            //TODO: handle dotall mode here
            return []
        }
    }
}

export function any(): Any {
    return new Any()
}

export function countOf(count: number, value: any): Repeat {
    return new Repeat(value, count, count)
}

export function countRangeOf(from: number, to: number, value: any): Repeat {
    return new Repeat(value, from, to)
}

export class Maybe extends Expression {
    public static parser = new SequenceParser([MAYBE, expressionOrBlock]).builder(
        ([expr]: Expression[]) => maybe(expr)
    )

    constructor(value: Expression) {
        super(ExpressionType.MAYBE, value)
    }

    generate(valid: boolean, rng: RandomSeed): string[] {
        const childExamples = this.value.generate(valid, rng)
        if (valid) {
            return [...childExamples, ""]
        } else {
            return childExamples
        }
    }
}

export function maybe(value: any): Maybe {
    return new Maybe(value)
}

export function sequence(value: Expression[]): Sequence {
    return new Sequence(value)
}

export function manyOf(value: Expression): Repeat {
    return new Repeat(value, 1, undefined)
}

export function literal(value: string): Sequence {
    return charSeqFromLiteral(value)
}
