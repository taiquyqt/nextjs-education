"use client";

import { useEffect, ChangeEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileUploadArea } from "@/components/uploader/file-upload-area";
import { FileList } from "@/components/uploader/file-list";
import { QuizSettingsForm } from "@/components/settings/quiz-settings-form";
import { GenerateActions } from "@/components/action/generate-actions";
import { ProcessingScreen } from "@/components/processing/processing-screen";
import { Leaf, Sparkles } from "lucide-react";
import { useQuizStore } from "@/lib/store/quizStore";
import { useQuizzStorage } from "@/lib/store/useQuizzStorage";
import { useTour } from "@reactour/tour";
import { useTeacherClasses } from "../../hook/useTeacherClasses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
function toOffsetDateTime(localDateTime: string) {
  if (!localDateTime) return "";
  return localDateTime + ":00Z"; 
}
export default function HomePage() {
  const { setIsOpen } = useTour();
  const { isGenerating } = useQuizStore();
  const { data, setData } = useQuizzStorage();
  const { reset } = useQuizzStorage();
  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userId = userStr ? JSON.parse(userStr).userId : null;

  const { data: classes = [], isLoading } = useTeacherClasses(userId);
function toInputDateTime(val?: string) {
  if (!val) return "";
  // Nếu có dạng YYYY-MM-DDTHH:MM:SSZ thì cắt bỏ phần giây và Z
  return val.replace(/:00Z$/, "");
}
const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  if (name === "startDate" || name === "endDate") {
    setData({ [name]: toOffsetDateTime(value) });
  } else {
    setData({ [name]: value });
  }
};
  return (
    <main className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-500 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-none">EduQuiz AI</p>
              <p className="text-xs text-muted-foreground">AI Quiz Generator</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="outline"
              className="border-green-500/30 text-green-700 hover:bg-green-50"
              onClick={() => setIsOpen(true)}
            >
              Hướng dẫn nhanh
            </Button>
            <Button className="bg-green-500 text-white hover:bg-green-600">
              <Sparkles className="mr-2 h-4 w-4" />
              Bắt đầu ngay
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-700">
                1) Nhập thông tin đề
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div data-tour="exam-info">
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-muted-foreground"
                    htmlFor="title"
                  >
                    Tiêu đề đề thi
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={data.title || ""}
                    onChange={(e) => setData({ title: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="classId">Khối lớp</Label>
                  <Select
                    value={data.classId?.toString() || ""}
                    onValueChange={(val) => {
                      const selected = classes.find(
                        (c) => c.id.toString() === val
                      );
                      const userStr = localStorage.getItem("user");
                      const userId = userStr
                        ? JSON.parse(userStr).userId
                        : null;

                      if (selected) {
                        setData({
                          classId: selected.id,
                          className: selected.className,
                          subject: selected.subject?.name || "",
                          createdBy: userId,
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp học" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-full">
                  <Label>Môn học</Label>
                  <Input value={data.subject || ""} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      className="text-sm font-medium text-muted-foreground"
                      htmlFor="startDate"
                    >
                      Ngày bắt đầu
                    </label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      name="startDate"
                      value={toInputDateTime(data.startDate)}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      className="text-sm font-medium text-muted-foreground"
                      htmlFor="endDate"
                    >
                      Ngày kết thúc
                    </label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      name="endDate"
                      value={toInputDateTime(data.endDate)}
                      onChange={handleChange}
                    />
                  </div>

                  
                </div>
<div className="space-y-1">
                    <label
                      className="text-sm font-medium text-muted-foreground"
                      htmlFor="timeLimit"
                    >
                      Thời gian (phút)
                    </label>
                    <Input
                      id="timeLimit"
                      type="number"
                      name="timeLimit"
                      value={data.timeLimit || ""}
                      placeholder="VD: 45"
                      onChange={handleChange}
                    />
                  </div>
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-muted-foreground"
                    htmlFor="description"
                  >
                    Mô tả đề
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Ghi chú thêm nếu cần..."
                    value={data.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Card
                data-tour="file-upload"
                className="border-green-500/20 mt-4"
              >
                <CardHeader>
                  <CardTitle className="text-green-700">
                    2) Tải tài liệu
                  </CardTitle>
                  <CardDescription>
                    Kéo & thả file hoặc chọn từ máy. Hỗ trợ PDF, DOCX, TXT,
                    MD...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUploadArea />
                  <Separator />
                  <FileList />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-700">3) Cấu hình AI</CardTitle>
              <CardDescription>
                Tuỳ chỉnh cách sinh câu hỏi và đầu ra mong muốn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuizSettingsForm />
              <GenerateActions />
            </CardContent>
          </Card>
          <p className="mt-4 text-xs text-muted-foreground">
            Mẹo: Chọn <code>{'"EXTRACT"'}</code> nếu tài liệu đã có câu hỏi;
            chọn <code>{'"GENERATE"'}</code> để AI tự tạo từ nội dung.
          </p>
        </div>
      </section>

      {isGenerating ? <ProcessingScreen /> : null}
    </main>
  );
}
