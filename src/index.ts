import {
    alternative,
    any,
    backreference,
    character,
    characterClass,
    digit,
    Expression,
    ExpressionType,
    letter,
    literal,
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
                if (obj.value === "\\w") {
                    return letter()
                } else if (obj.value === "\\d") {
                    return digit()
                }

                return literal(obj.value)
            case ExpressionType.ANY:
                return any()
            case ExpressionType.REPEAT:
                return repeat(this.fromJSON(obj.child), obj.lower, obj.upper, obj.lazy)
            case ExpressionType.SEQUENCE:
                return sequence(...obj.children.map(this.fromJSON.bind(this)))
            case ExpressionType.CHARACTER:
                return character(obj.value)
            case ExpressionType.ALTERNATIVE:
                return alternative(...obj.children.map(this.fromJSON.bind(this)))
            case ExpressionType.CHARACTER_CLASS:
                return characterClass(obj.members)
            case ExpressionType.BACKREFERENCE:
                return backreference(obj.groupName)
            case ExpressionType.GROUP:
                // groups from the regex generator are never relevant since they are only ever used for operator precedence
                return this.fromJSON(obj.child)
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
console.log(dsl)
console.log(dsl.toRegex())
