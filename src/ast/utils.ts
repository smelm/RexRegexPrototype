import { Expression } from "./Expression"

export function findInAST(tree: Expression, condition: Function): Expression[] {
    if (condition(tree)) {
        return [tree]
    }

    let treeCopy = tree as any

    if ("child" in treeCopy) {
        return findInAST(treeCopy.child, condition)
    }

    if ("children" in treeCopy) {
        return treeCopy.children.flatMap((x: Expression) => findInAST(x, condition))
    }

    return []
}
