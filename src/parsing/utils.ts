export function intersperse(list: any[], sep: any): any[] {
    return list.flatMap(item => [sep, item]).slice(1)
}
