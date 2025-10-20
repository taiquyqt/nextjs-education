"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useQuizStore } from "@/lib/store/quizStore";

export function ProcessingScreen() {
  const { files, settings } = useQuizStore();
  const fileNames = useMemo(() => files.map((f) => f.name).join(", "), [files]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-white/80 backdrop-blur"
    >
      <div className="w-[95vw] max-w-md rounded-lg border border-green-500/30 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="font-medium text-green-800">AI đang xử lý...</p>
            <p className="text-xs text-muted-foreground">
              {settings.generationMode === "EXTRACT"
                ? "Trích xuất câu hỏi từ tài liệu"
                : "Sinh câu hỏi từ nội dung"}
              .
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-md bg-green-50/60 p-3 text-xs text-green-900">
          <p className="line-clamp-2">
            Đang xử lý:{" "}
            <span className="font-medium">{fileNames || "..."}</span>
          </p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-green-100">
          <div className="h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] rounded-full bg-green-500" />
        </div>
        <style jsx>{`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(20%);
            }
            100% {
              transform: translateX(120%);
            }
          }
        `}</style>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Vui lòng đợi, chúng tôi đang tối ưu đầu ra theo cấu hình của bạn.
        </p>
      </div>
    </div>
  );
}
