"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, FileText } from "lucide-react";
import { useQuizStore } from "@/lib/store/quizStore";

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileList() {
  const { files, removeFile, clearFiles } = useQuizStore();
  if (!files.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có tệp nào được tải lên.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-green-700">
          Đã chọn {files.length} tệp
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFiles}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Xoá tất cả
        </Button>
      </div>
      <Separator />
      <ul className="space-y-2">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between rounded-md border border-green-500/10 bg-green-50/40 p-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-green-600 ring-1 ring-green-500/20">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {f.type || "unknown"} • {humanSize(f.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Xoá ${f.name}`}
              onClick={() => removeFile(f.id)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
