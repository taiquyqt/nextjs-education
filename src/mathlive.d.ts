// src/types/mathlive.d.ts
declare namespace JSX {
    interface IntrinsicElements {
        "math-field": React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>,
            HTMLElement
        > & {
            // các attribute MathLive hỗ trợ
            "virtual-keyboard-mode"?: "manual" | "onfocus" | "off";
            "virtual-keyboard-layout"?: string;
            "virtual-keyboard-theme"?: string;
            "smart-fence"?: boolean;
            "smart-mode"?: boolean;
        };
    }
}
