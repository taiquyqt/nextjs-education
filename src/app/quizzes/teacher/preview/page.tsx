"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Save, Edit3, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuizEditor } from "@/components/editor/quiz-editor";
import { ConfirmLeaveDialog } from "@/components/shared/confirm-leave-dialog";
import { useQuizzStorage } from "@/lib/store/useQuizzStorage";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useApproveQuiz,
  useUpdateQuizMeta,
  useCreateQuiz,
  useQuiz,
  useReplaceQuizContent,
} from "../../hook/quiz-hooks"; 
import { toast } from "react-toastify"; 
const formatDateForInput = (val?: string | Date | null) => {
  if (!val) return "";

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return ""; 
    const offset = val.getTimezoneOffset();
    const localDate = new Date(val.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  }

  if (typeof val === "string") {
    if (!val.endsWith("Z")) return val;

    try {
      const date = new Date(val);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      return "";
    }
  }

  return "";
};

export default function QuizEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: quiz, setData, reset } = useQuizzStorage();

  const mode = searchParams.get("mode") || "create"; // default to create
  const quizId = searchParams.get("id");

  // Fetch quiz data when in edit mode
  const { data: quizData, isLoading } = useQuiz(
    mode === "edit" ? quizId : undefined
  );

  // Set quiz data to storage when fetched in edit mode
  useEffect(() => {
    if (mode === "edit" && quizData) {
      setData({
        ...quizData,
        // Format date khi load từ API về
        startDate: formatDateForInput(quizData.startDate),
        endDate: formatDateForInput(quizData.endDate),
      });
    }
  }, [mode, quizData, setData]);

  const approveMutation = useApproveQuiz();
  const createMutation = useCreateQuiz();
  const updateMetaMutation = useUpdateQuizMeta(Number(quizId));
  const replaceContentMutation = useReplaceQuizContent(Number(quizId));

  const [showConfirm, setShowConfirm] = useState(false);

  const currentMutation = useMemo(() => {
    switch (mode) {
      case "edit":
        return {
          mutate: async (data: any) => {
            const {
              title,
              classId,
              timeLimit,
              description,
              questions,
              startDate,
              endDate,
              ...rest
            } = data;

            await updateMetaMutation.mutateAsync({
              title,
              classId,
              timeLimit: Number(timeLimit),
              description,
              startDate: startDate ? new Date(startDate).toISOString() : undefined,
              endDate: endDate ? new Date(endDate).toISOString() : undefined,
            });

            if (questions && questions.length > 0) {
              await replaceContentMutation.mutateAsync({ questions });
            }
          },
          isPending:
            updateMetaMutation.isPending || replaceContentMutation.isPending,
        };
      case "create":
        return createMutation;
      default:
        return approveMutation;
    }
  }, [
    mode,
    createMutation,
    approveMutation,
    updateMetaMutation,
    replaceContentMutation,
    quizId,
  ]);

  const title = useMemo(() => {
    const n = quiz?.questions.length ?? 0;
    switch (mode) {
      case "edit":
        return `Chỉnh sửa quiz (${n} câu hỏi)`;
      case "create":
        return `Tạo quiz mới (${n} câu hỏi)`;
      default:
        return `Duyệt quiz (${n} câu hỏi)`;
    }
  }, [quiz, mode]);

  const subtitle = useMemo(() => {
    switch (mode) {
      case "edit":
        return "Cập nhật thông tin quiz & câu hỏi";
      case "create":
        return "Tạo quiz mới với câu hỏi";
      default:
        return "Sửa thông tin quiz & câu hỏi";
    }
  }, [mode]);

  function onBack() {
    setShowConfirm(true);
  }

  async function onPrimaryAction() {
    const mutation = currentMutation;

    // Prepare payload
    let payload = mode === "edit" ? { ...quiz, id: quizId } : quiz;

    // Đảm bảo convert sang ISO string (có Z) trước khi gửi đi
    if (mode === "create") {
      payload = {
        ...payload,
        startDate: quiz.startDate ? new Date(quiz.startDate).toISOString() : undefined,
        endDate: quiz.endDate ? new Date(quiz.endDate).toISOString() : undefined,
      };
    }

    mutation.mutate(payload, {
      onSuccess: (result) => {
        switch (mode) {
          case "edit":
            toast.success("Cập nhật quiz thành công");
            break;
          case "create":
            toast.success("Tạo quiz thành công");
            break;
          default:
            toast.success("Duyệt quiz thành công");
        }

        if (mode === "create") {
          // reset(); // Có thể uncomment nếu muốn reset store
          router.push("/quizzes/teacher");
        }
      },
      onError: (error) => {
        console.error("Lỗi:", error);
        toast.error("Thao tác thất bại, vui lòng kiểm tra lại.");
      },
    });
  }

  const primaryButtonConfig = useMemo(() => {
    switch (mode) {
      case "edit":
        return {
          icon: Edit3,
          text: currentMutation.isPending ? "Đang cập nhật..." : "Cập nhật quiz",
          className: "bg-blue-500 text-white hover:bg-blue-600",
        };
      case "create":
        return {
          icon: Plus,
          text: currentMutation.isPending ? "Đang tạo..." : "Tạo quiz",
          className: "bg-green-500 text-white hover:bg-green-600",
        };
      default:
        return {
          icon: CheckCircle2,
          text: currentMutation.isPending ? "Đang gửi..." : "Duyệt quiz",
          className: "bg-green-500 text-white hover:bg-green-600",
        };
    }
  }, [mode, currentMutation.isPending]);

  const cardTitleConfig = useMemo(() => {
    switch (mode) {
      case "edit":
        return {
          info: "Thông tin quiz",
          questions: "Câu hỏi",
          className: "text-blue-700",
        };
      case "create":
        return {
          info: "Thông tin quiz mới",
          questions: "Câu hỏi",
          className: "text-green-700",
        };
      default:
        return {
          info: "Thông tin quiz",
          questions: "Câu hỏi",
          className: "text-green-700",
        };
    }
  }, [mode]);

  const borderColorClass = useMemo(() => {
    return mode === "edit" ? "border-blue-500/20" : "border-green-500/20";
  }, [mode]);

  const inputColorClass = useMemo(() => {
    return mode === "edit"
      ? "border-blue-500/30 focus:ring-blue-500"
      : "border-green-500/30 focus:ring-green-500";
  }, [mode]);

  const backButtonConfig = useMemo(() => {
    return {
      className: mode === "edit" ? "text-blue-700 hover:bg-blue-50" : "text-green-700 hover:bg-green-50",
    };
  }, [mode]);

  const saveButtonConfig = useMemo(() => {
    return {
      className:
        mode === "edit"
          ? "border-blue-500/30 text-blue-700 hover:bg-blue-50"
          : "border-green-500/30 text-green-700 hover:bg-green-50",
    };
  }, [mode]);

  // Loading state for Edit mode
  if (mode === "edit" && isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <Loader2 className="animate-spin mr-2 h-8 w-8 text-blue-600" />
        <span className="text-slate-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className={backButtonConfig.className}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <p className={`font-semibold ${cardTitleConfig.className}`}>
                {title}
              </p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className={saveButtonConfig.className}>
              <Save className="mr-2 h-4 w-4" />
              Lưu tất cả
            </Button>
            <Button
              onClick={onPrimaryAction}
              className={primaryButtonConfig.className}
              disabled={currentMutation.isPending}
            >
              {currentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <primaryButtonConfig.icon className="mr-2 h-4 w-4" />
              )}
              {primaryButtonConfig.text}
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-10">
          <div className="md:col-span-3 space-y-4">
            <Card className={borderColorClass}>
              <CardHeader>
                <CardTitle className={cardTitleConfig.className}>
                  {cardTitleConfig.info}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Tiêu đề</Label>
                  <Input
                    value={quiz?.title || ""}
                    onChange={(e) => setData({ title: e.target.value })}
                    className={`${inputColorClass} mt-2`}
                  />
                </div>
                <div>
                  <Label>ID lớp</Label>
                  <Input
                    value={quiz?.classId || ""}
                    onChange={(e) => setData({ classId: e.target.value })}
                    className={`${inputColorClass} mt-2`}
                    disabled={mode === "edit"}
                  />
                </div>

                {/* --- NGÀY GIỜ SỬ DỤNG HÀM FIXED --- */}
                <div className="space-y-3 pt-2">
                  <div>
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="datetime-local"
                      value={formatDateForInput(quiz?.startDate)}
                      onChange={(e) => setData({ startDate: e.target.value })}
                      className={`${inputColorClass} mt-2 text-sm`}
                    />
                  </div>

                  <div>
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="datetime-local"
                      value={formatDateForInput(quiz?.endDate)}
                      onChange={(e) => setData({ endDate: e.target.value })}
                      className={`${inputColorClass} mt-2 text-sm`}
                    />
                  </div>
                </div>

                <div>
                  <Label>Thời gian làm (phút)</Label>
                  <Input
                    type="number"
                    value={quiz?.timeLimit || ""}
                    onChange={(e) => setData({ timeLimit: e.target.value })}
                    className={`${inputColorClass} mt-2`}
                  />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea
                    value={quiz?.description || ""}
                    onChange={(e) => setData({ description: e.target.value })}
                    className={`${inputColorClass} mt-2`}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-7">
            <Card className={borderColorClass}>
              <CardHeader>
                <CardTitle className={cardTitleConfig.className}>
                  {cardTitleConfig.questions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                <QuizEditor />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ConfirmLeaveDialog
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          reset();
          router.back();
        }}
      />
    </main>
  );
}