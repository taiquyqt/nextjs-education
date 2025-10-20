"use client";

import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store/quizStore";
import { callGenerateAPI, validateFile } from "@/lib/api";

export function GenerateActions() {
  const router = useRouter();
  const { files, setGenerating, isGenerating, setQuiz } = useQuizStore();

  const hasFiles = files.length > 0;
  const { generationMode } = useQuizStore((s) => s.settings);
  const buttonLabel =
    generationMode === "EXTRACT" ? "Extract Quiz" : "Generate AI Quiz";

  function isRealFile(x: any): x is File {
    return (
      x instanceof File ||
      (x &&
        typeof x.name === "string" &&
        typeof x.size === "number" &&
        typeof x.type === "string" &&
        typeof x.arrayBuffer === "function")
    );
  }

  function extractRealFile(input: any): File | null {
    if (!input) return null;

    if (isRealFile(input)) return input;

    if (isRealFile(input.originFileObj)) return input.originFileObj as File;

    if (isRealFile(input.file)) return input.file as File;

    if (input instanceof Blob && typeof input.name === "string") {
      try {
        return new File([input], input.name, {
          type: input.type || "application/octet-stream",
          lastModified: Date.now(),
        });
      } catch {}
    }

    return null;
  }

  async function onGenerate() {
    if (!hasFiles) {
      toast.error("Vui lòng tải lên ít nhất 1 tệp.");
      return;
    }

    const firstRaw = files[0];
    const realFile = extractRealFile(firstRaw);
    if (!realFile) {
      console.error("files[0] =", firstRaw);
      toast.error(
        "Không lấy được File thật. Hãy truyền item.file hoặc originFileObj."
      );
      return;
    }

    const { valid, error } = validateFile(realFile as File);
    if (!valid) {
      toast.error(error || "File không hợp lệ.");
      return;
    }

    try {
      setGenerating(true);

      const { settings, getBackendSettings } = useQuizStore.getState();
      console.log("Form settings (UI):", settings);

      const aiQuizSettings = getBackendSettings();
      console.log("Form settings (Backend format):", aiQuizSettings);

      await callGenerateAPI({
        file: realFile,
        settings: aiQuizSettings,
      });

      router.push("quizzPreview");
    } catch (err: any) {
      console.error("Generate quiz error:", err);
      toast.error(err?.message ?? "Không thể tạo quiz. Thử lại sau.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex items-center justify-end">
      <Button
        data-tour="generate-action"
        onClick={onGenerate}
        disabled={!hasFiles || isGenerating}
        className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PlayCircle className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? "Đang xử lý..." : buttonLabel}
      </Button>
    </div>
  );
}
