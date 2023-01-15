import { alt, regex, Rule, sepBy, seq, whitespace as _, seqObj } from "parsimmon"
import { kw } from "./keywords"
import { lineOrBlock, opt, statementSeperator } from "./utils"
import * as builders from "../ast"
import { CharacterClass } from "../ast/CharacterClass"

export const characterClass: Rule = {
    charRange: r =>
        //@ts-ignore
        seqObj(["lower", r.rawLiteral], _, kw.to, _, ["upper", r.rawLiteral]).map((obj: any) => [
            obj.lower,
            obj.upper,
        ]),
    charClassList: r =>
        sepBy(alt(r.charRange, r.rawLiteral, r.variable), regex(/ *, */).desc("list_separator")),
    charClassHeader: () => seq(kw.any, opt(seq(_, kw.except)), _, kw.of),
    charClassListMultiline: r =>
        sepBy(r.charClassList, statementSeperator.notFollowedBy(alt(kw.except, kw.end))).map(x => {
            return x.flat()
        }),
    charClass: r =>
        lineOrBlock(
            r.charClassHeader,
            seq(
                r.charClassList,
                opt(seq(_, kw.except, _, kw.of, _, r.charClassList).map(x => x[x.length - 1]))
            ),
            seq(
                r.charClassListMultiline,
                opt(
                    seq(
                        statementSeperator,
                        kw.except,
                        _,
                        kw.of,
                        statementSeperator,
                        r.charClassListMultiline
                    ).map(x => x[x.length - 1])
                )
            )
        ).map(({ content, header }) => {
            const [anyOf, except] = content as any
            let result: CharacterClass
            if (header.join("").includes("except")) {
                result = builders.anyExcept(...anyOf)
            } else {
                result = builders.anyOf(...anyOf)
            }

            if (except) {
                result = result.exceptOf(...except)
            }

            return result
        }),
}
