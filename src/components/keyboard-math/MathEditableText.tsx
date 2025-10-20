import { useState, useMemo } from "react";
import katex from "katex";
import { replaceNthMath, splitLatexSegments } from "@/untils/utils";
import { MathliveModal } from "./MathliveModal";

export function MathEditableText({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
}) {
  const segments = useMemo(() => splitLatexSegments(value), [value]);
  const [modal, setModal] = useState<{
    open: boolean;
    latex: string;
    index: number;
    display: boolean;
  }>({ open: false, latex: "", index: -1, display: false });

  const handleSave = (latex: string) => {
    const next = replaceNthMath(value, modal.index, latex, modal.display);
    onChange(next);
    setModal((m) => ({ ...m, open: false }));
  };

  return (
    <>
      <div className={`prose max-w-none ${className}`}>
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.content}</span>;
          let html = "";
          try {
            html = katex.renderToString(seg.content, {
              throwOnError: false,
              displayMode: seg.display,
            });
          } catch {
            html = `<span class="text-red-600">[Công thức lỗi]</span>`;
          }
          return (
            <span
              key={i}
              className="cursor-pointer hover:bg-blue-50 rounded px-1 transition-colors"
              title="Bấm để sửa công thức"
              onClick={() =>
                setModal({
                  open: true,
                  latex: seg.content,
                  index: seg.index,
                  display: seg.display,
                })
              }
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </div>

      <MathliveModal
        open={modal.open}
        initialLatex={modal.latex}
        display={modal.display}
        onCancel={() => setModal((m) => ({ ...m, open: false }))}
        onSave={handleSave}
      />
    </>
  );
}
