import { useEffect, useRef } from "react";
import katex from "katex";

export function MathliveModal({
  open,
  initialLatex,
  display,
  onCancel,
  onSave,
}: {
  open: boolean;
  initialLatex: string;
  display: boolean;
  onCancel: () => void;
  onSave: (latex: string) => void;
}) {
  const mfRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      await import("mathlive");
      const kbd: any = (window as any).mathVirtualKeyboard;
      if (kbd) {
        kbd.theme = "material";
      }
      const el = mfRef.current as any;
      if (el) {
        el.setOptions?.({
          virtualKeyboardMode: "onfocus",
          smartMode: true,
          smartFence: true,
        });
        el.value = initialLatex || "";
        setTimeout(() => {
          el.focus();
          el.executeCommand?.("showVirtualKeyboard");
        }, 100);
      }
    })();
  }, [open, initialLatex]);

  if (!open) return null;

  const renderPreview = () => {
    const latex =
      (mfRef.current as any)?.getValue?.("latex-expanded") ??
      initialLatex ??
      "";
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: display,
      });
    } catch {
      return `<span class="text-red-600">Không render được công thức</span>`;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Soạn thảo công thức</h3>
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>

        {/* @ts-ignore */}
        <math-field
          ref={mfRef}
          virtual-keyboard-mode="onfocus"
          style={{
            width: "100%",
            minHeight: 48,
            fontSize: 24,
            padding: 4,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
          placeholder="Nhập/sửa công thức…"
        ></math-field>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              const latex =
                (mfRef.current as any)?.getValue?.("latex-expanded") ??
                (mfRef.current as any)?.value ??
                "";
              onSave(latex);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
}
