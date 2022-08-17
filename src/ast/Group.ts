import { RandomSeed } from "random-seed"
import { BEGIN } from "../keywords"
import { SequenceParser } from "../parsing"
import { Expression } from "./Expression"
import { ExpressionType } from "./Expression"
import { IdentifierParser, spaces as _ } from "../parsing"
import { expressionOrBlock } from "../Expression"

export class Group extends Expression {
    public static parser = new SequenceParser([
        BEGIN,
        _,
        new IdentifierParser(),
        expressionOrBlock,
    ]).builder(([groupName, content]: [string, Expression]) => new Group(groupName, content))

    constructor(private name: string, private content: Expression) {
        super(ExpressionType.GROUP, content)
    }

    toRegex(): string {
        return `(?<${this.name}>${this.content.toRegex()})`
    }

    generateValid(rng: RandomSeed): string[] {
        return this.value.generateValid(rng)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.value.generateInvalid(rng)
    }
}
