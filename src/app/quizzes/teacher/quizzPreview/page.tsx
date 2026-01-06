"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuizEditor } from "@/components/editor/quiz-editor";
import { ConfirmLeaveDialog } from "@/components/shared/confirm-leave-dialog";
import { useQuizzStorage } from "@/lib/store/useQuizzStorage";
import { useRouter } from "next/navigation";
import { useApproveQuiz } from "../../hook/quiz-hooks";

// --- 1. KHAI BÁO HÀM HELPER Ở ĐÂY (TRƯỚC COMPONENT CHÍNH) ---
const formatDateForInput = (val?: string | Date | null) => {
  if (!val) return "";
  
  // Trường hợp là Date Object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    const offset = val.getTimezoneOffset();
    const localDate = new Date(val.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  }

  // Trường hợp là String
  if (typeof val === "string") {
    // Nếu không có 'Z' (đã là local format hoặc user đang nhập) -> Giữ nguyên
    if (!val.endsWith("Z")) return val;
    
    // Nếu có 'Z' (ISO từ server) -> Convert sang local
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

// --- COMPONENT CHÍNH ---
export default function QuizEditPage() {
  const router = useRouter();
  const { data: quiz, setData, reset } = useQuizzStorage();

  const approveMutation = useApproveQuiz();
  const [showConfirm, setShowConfirm] = useState(false);

  const title = useMemo(() => {
    const n = quiz?.questions?.length ?? 0;
    return `Chỉnh sửa quiz (${n} câu hỏi)`;
  }, [quiz]);

  function onBack() {
    setShowConfirm(true);
  }

  async function onApprove() {
    approveMutation.mutate(quiz, {
      onSuccess: (result) => {
        console.log("Duyệt quiz thành công:", result);
        useQuizzStorage.getState().reset();
        router.push("/quizzes/teacher");
      },
      onError: (error) => {
        console.error("Gửi quiz thất bại:", error);
      },
    });
  }

  return (
    <main className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-green-700 hover:bg-green-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <p className="font-semibold text-green-700">{title}</p>
              <p className="text-xs text-muted-foreground">
                Sửa thông tin quiz & câu hỏi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onApprove}
              className="bg-green-500 text-white hover:bg-green-600"
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {approveMutation.isPending ? "Đang gửi..." : "Duyệt quiz"}
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-10">
          <div className="md:col-span-3 space-y-4">
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-700">Thông tin quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Tiêu đề */}
                <div>
                  <Label>Tiêu đề</Label>
                  <Input
                    value={quiz.title ?? ""}
                    onChange={(e) => setData({ title: e.target.value })}
                    className="border-green-500/30 focus:ring-green-500 mt-2"
                  />
                </div>

                {/* --- INPUT NGÀY BẮT ĐẦU & KẾT THÚC --- */}
                <div className="space-y-3 pt-1">
                  <div>
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="datetime-local"
                      // Gọi hàm helper ở đây sẽ không bị lỗi nữa
                      value={formatDateForInput(quiz.startDate)}
                      onChange={(e) => setData({ startDate: e.target.value })}
                      className="border-green-500/30 mt-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="datetime-local"
                      // Gọi hàm helper ở đây sẽ không bị lỗi nữa
                      value={formatDateForInput(quiz.endDate)}
                      onChange={(e) => setData({ endDate: e.target.value })}
                      className="border-green-500/30 mt-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label>Lớp</Label>
                  <Input
                    value={quiz.className ?? ""}
                    onChange={(e) => setData({ className: e.target.value })}
                    className="border-green-500/30 mt-2"
                  />
                </div>
                <div>
                  <Label>Môn học</Label>
                  <Input
                    value={quiz.subject ?? ""}
                    onChange={(e) => setData({ subject: e.target.value })}
                    className="border-green-500/30 mt-2"
                  />
                </div>
                <div>
                  <Label>Thời gian làm (phút)</Label>
                  <Input
                    type="number"
                    value={quiz.timeLimit ?? ""}
                    onChange={(e) => setData({ timeLimit: e.target.value })}
                    className="border-green-500/30 mt-2"
                  />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea
                    value={quiz.description ?? ""}
                    onChange={(e) => setData({ description: e.target.value })}
                    className="border-green-500/30 mt-2"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-7">
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-700">Câu hỏi</CardTitle>
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
          router.push("/");
        }}
      />
    </main>
  );
}