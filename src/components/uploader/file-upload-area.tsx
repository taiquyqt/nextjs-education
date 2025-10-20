"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/untils/utils";
import { useQuizStore } from "@/lib/store/quizStore";

export function FileUploadArea() {
  const { addFiles } = useQuizStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      multiple: true,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "text/plain": [".txt"],
        "text/markdown": [".md"],
      },
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition",
        "border-green-500/40 hover:border-green-500/60 hover:bg-green-50/40",
        isDragActive && "bg-green-50 border-green-500",
        isDragReject && "border-red-500"
      )}
      aria-label="Khu vực tải tệp"
    >
      <input {...getInputProps()} aria-label="Chọn tệp để tải lên" />
      <div className="pointer-events-none flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm">
          Kéo & thả file vào đây, hoặc{" "}
          <span className="font-medium text-green-700 underline">
            chọn từ máy
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Hỗ trợ: PDF, DOCX, TXT, MD
        </p>
      </div>
    </div>
  );
}
