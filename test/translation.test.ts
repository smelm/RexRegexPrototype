import { translate, tokenize } from "../src"

describe("tokenization", () => {
    test("splits into lines of tokens", () => {
        expect(tokenize("foo\nbar bam")).toEqual([["foo"], ["bar", "bam"]])
    })
})

describe("translate DSL into Regex", () => {
    test("any translates to .", () => {
        expect(translate("any")).toEqual(".")
    })

    test("many of translates to +", () => {
        expect(translate("many of any")).toEqual(".+")
    })
})
