import { alt, regex, Rule, sepBy1, seq, string, whitespace as _ } from "parsimmon"
import { isKeyword, kw } from "./keywords"
import { makeDSLParser } from "./parser"
import { block, DOT, lineOrBlock, opt } from "./utils"

export function parseMacros(variables: any): Rule {
    return {
        variableDefinition: r =>
            lineOrBlock(
                kw.define.then(_).then(r.identifier).skip(_).skip(kw.as),
                r.expression,
                r.expressionSequence
            )
                .assert(
                    ({ header: name }) => !(name in variables),
                    "duplicate identifier definition"
                )
                .chain(({ header: path, content }) => {
                    let variablesCopy = { ...variables }
                    let variableName = path.pop()

                    let currentPosition = variablesCopy
                    for (let key of path) {
                        if (!currentPosition[key]) {
                            currentPosition[key] = {}
                        } else if (typeof currentPosition[key] !== "object") {
                            throw new Error("overwriting variable with namespace")
                        }
                        currentPosition = currentPosition[key]
                    }
                    currentPosition[variableName] = content
                    return makeDSLParser(variablesCopy)
                }),
        variable: r =>
            r.identifier.map(path => {
                let position = variables

                for (let key of path) {
                    position = position[key]

                    if (!position) {
                        throw new Error(`could not find ${path.join(".")}`)
                    }
                }

                return position
            }),
        funcArgs: r =>
            sepBy1(alt(r.rawLiteral, r.variable), opt(_).then(regex(/ *, */))).desc("args"),
        functionCall: r =>
            seq(r.variable, r.funcArgs.wrap(string("("), string(")"))).map(([func, args]) => {
                return func(...args)
            }),
        blockFunctionCall: r =>
            block(kw.begin.skip(_).then(alt(r.functionCall, r.variable)), r.expressionSequence).map(
                ({ header, content }) => {
                    return header(content)
                }
            ),
        identifier: r =>
            sepBy1(r.identifierName, DOT).assert(
                ident => !ident.some(isKeyword),
                "keyword cannot be used in variable names"
            ),
        identifierName: () => regex(/[a-zA-Z]\w*/),
    }
}
