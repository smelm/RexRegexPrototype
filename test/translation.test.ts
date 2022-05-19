import { translate, tokenize } from "../src"

describe("tokenization", () => {
    test("splits into lines of tokens", () => {
        expect(tokenize("foo\nbar bam")).toEqual([["foo"], ["bar", "bam"]])
    })
})

describe("translate DSL into Regex", () => {
    test("any matches any character", () => {
        expect(translate("any")).toEqual(".")
    })
})
