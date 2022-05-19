import { translate } from "../src";

describe("translate DSL into Regex", () => {
  test("it works", () => {
    expect(translate("foo")).toEqual("foo");
  });
});
