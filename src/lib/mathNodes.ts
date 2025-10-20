import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";

export type MathNodeInfo = {
    kind: "inline" | "block";
    latex: string;
    start: number; // offset trong chuỗi
    end: number;   // offset trong chuỗi
    index: number; // thứ tự xuất hiện
};

/** Parse markdown để lấy danh sách node toán kèm offset start/end */
export function extractMathNodesWithOffsets(markdown: string): MathNodeInfo[] {
    const tree: any = unified().use(remarkParse).use(remarkMath).parse(markdown);
    const nodes: MathNodeInfo[] = [];
    let idx = 0;

    visit(tree, (node: any) => {
        if (node.type === "inlineMath" || node.type === "math") {
            const start = node.position?.start?.offset ?? -1;
            const end = node.position?.end?.offset ?? -1;
            if (start >= 0 && end >= 0) {
                nodes.push({
                    kind: node.type === "inlineMath" ? "inline" : "block",
                    latex: node.value ?? "",
                    start,
                    end,
                    index: idx++,
                });
            }
        }
    });

    return nodes;
}

/** Thay thế chính xác 1 node toán (theo offset + loại wrapper) */
export function replaceAtOffsets(
    src: string,
    start: number,
    end: number,
    newLatex: string,
    kind: "inline" | "block"
) {
    const wrapper =
        kind === "inline" ? (s: string) => `$${s}$` : (s: string) => `$$\n${s}\n$$`;
    return src.slice(0, start) + wrapper(newLatex) + src.slice(end);
}
