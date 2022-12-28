import {
    alternative,
    any,
    backreference,
    character,
    characterClass,
    Expression,
    ExpressionType,
    group,
    literal,
    maybe,
    repeat,
    sequence,
} from "./ast"
import { DSLScript, ScriptSettings } from "./ast/DSLScript"
import { makeDSL } from "./parser"
import { readFileSync } from "fs"

export { makeDSLParser } from "./parser"
export * from "./ast"

export class RexRegex {
    static fromString(code: string, variables: any): DSLScript {
        return makeDSL(variables).tryParse(code)
    }

    static fromCode(expression: Expression, settings?: ScriptSettings): DSLScript {
        return new DSLScript(expression, settings)
    }

    private static fromJSON(obj: any): Expression {
        console.log(obj)
        switch (obj.type as string) {
            case "literal":
                return literal(obj.value)
            case ExpressionType.ANY:
                return any()
            case ExpressionType.REPEAT:
                return repeat(RexRegex.fromJSON(obj.child), obj.lower, obj.upper)
            case ExpressionType.MAYBE:
                return maybe(RexRegex.fromJSON(obj.child))
            case ExpressionType.SEQUENCE:
                return sequence(...obj.children.map(RexRegex.fromJSON))
            case ExpressionType.CHARACTER:
                return character(obj.value)
            case ExpressionType.GROUP:
                return group(obj.name, RexRegex.fromJSON(obj.child))
            case ExpressionType.ALTERNATIVE:
                return alternative(...obj.children.map(RexRegex.fromJSON))
            case ExpressionType.CHARACTER_CLASS:
                return characterClass(obj.members)
            case ExpressionType.BACKREFERENCE:
                return backreference(obj.groupName)
            default:
                console.log(obj)
                throw new Error("could not convert value into an expression")
        }
    }

    // TODO return DSLScript
    static importFromFile(fileName: string) {
        const jsonContent = readFileSync(fileName).toString()
        const obj = JSON.parse(jsonContent)
        return this.fromCode(this.fromJSON(obj))
    }
}

let dsl = RexRegex.importFromFile("src/generated.json")
// console.log(dsl)
console.log(dsl.toRegex())
