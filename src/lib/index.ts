import { Expression, ExpressionType } from "../ast/Expression"
import { any, literal, manyOf, sequence } from "../ast/astBuilders"
import { RandomSeed } from "random-seed"

class NegativeLookAhead extends Expression {
    constructor(private child: Expression) {
        super(ExpressionType.CUSTOM)
    }

    generateValid(_ast: Expression, _rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }

    generateInvalid(_ast: Expression, _rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(): string {
        return `(?!${this.child.toRegex()})`
    }

    toString(): string {
        throw new Error("Method not implemented.")
    }

    toDSL(_identLevel: number): string {
        throw new Error("Method not implemented.")
    }
}

export function surroundWith(begin: string, end: string = ""): Expression {
    if (!end) {
        end = begin
    }
    return sequence(
        literal(begin),
        manyOf(sequence(new NegativeLookAhead(literal(end)), any())),
        literal(end)
    )
}
