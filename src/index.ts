import { Expression } from "./ast"
import { DSLScript, ScriptSettings } from "./ast/DSLScript"
import { makeDSL } from "./parser"

export { makeDSLParser } from "./parser"
export * from "./ast"

export class RexRegex {
    static fromString(code: string, variables: any): DSLScript {
        return makeDSL(variables).tryParse(code)
    }

    static fromCode(expression: Expression, settings: ScriptSettings): DSLScript {
        return new DSLScript(expression, settings)
    }
}
