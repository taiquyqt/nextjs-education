"use client";

import { useEffect, ChangeEvent } from "react";
import Link from "next/link"; // Import Link
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
import { FileUploadArea } from "@/components/uploader/file-upload-area";
import { FileList } from "@/components/uploader/file-list";
import { QuizSettingsForm } from "@/components/settings/quiz-settings-form";
import { GenerateActions } from "@/components/action/generate-actions";
import { ProcessingScreen } from "@/components/processing/processing-screen";
import { Leaf, Sparkles, ArrowLeft } from "lucide-react"; // Import ArrowLeft
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

// --- HÀM HELPER ---
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const getFutureDateTimeLocal = (minutesToAdd: number) => {
  const now = new Date();
  const future = new Date(now.getTime() + minutesToAdd * 60000);
  future.setMinutes(future.getMinutes() - future.getTimezoneOffset());
  return future.toISOString().slice(0, 16);
};
// ------------------

export default function HomePage() {
  const { setIsOpen } = useTour();
  const { isGenerating } = useQuizStore();
  const { data, setData } = useQuizzStorage();
  
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userId = userStr ? JSON.parse(userStr).userId : null;
  const { data: classes = [] } = useTeacherClasses(userId);

  // --- INIT DATA ---
  useEffect(() => {
    if (!data.startDate) {
      setData({
        ...data,
        startDate: getCurrentDateTimeLocal(),
        endDate: getFutureDateTimeLocal(45),
        timeLimit: 45,
      });
    }
  }, []); 

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData({ [name]: value });
  };

  return (
    <main className="min-h-dvh bg-slate-50/50"> {/* Thêm chút màu nền nhẹ cho dịu mắt */}
      
      {/* --- HEADER --- */}
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

      {/* --- NÚT TRỞ VỀ --- */}
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-2">
        <Link href="/quizzes/teacher/createQuiz">
          <Button 
            variant="ghost" 
            className="pl-0 gap-2 text-slate-500 hover:text-green-600 hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium text-base">Quay lại</span>
          </Button>
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-5">
        
        {/* --- CỘT TRÁI (FORM) --- */}
        <div className="md:col-span-3">
          <Card className="border-green-500/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-700 text-xl">
                1) Nhập thông tin đề
              </CardTitle>
            </CardHeader>
            
            {/* Tăng spacing ở đây để dãn dòng */}
            <CardContent className="space-y-6">
              
              <div data-tour="exam-info" className="space-y-6"> {/* Thay grid gap-3 bằng space-y-6 */}
                
                {/* Title */}
                <div className="space-y-2"> {/* Tăng label spacing */}
                  <Label htmlFor="title" className="text-base">Tiêu đề đề thi <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    className="h-10"
                    value={data.title || ""}
                    onChange={(e) => setData({ title: e.target.value })}
                    placeholder="Nhập tên bài kiểm tra..."
                  />
                </div>

                {/* Class Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Chia cột cho thoáng */}
                    <div className="space-y-2">
                    <Label htmlFor="classId" className="text-base">Khối lớp <span className="text-red-500">*</span></Label>
                    <Select
                        value={data.classId?.toString() || ""}
                        onValueChange={(val) => {
                        const selected = classes.find((c) => c.id.toString() === val);
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
                        <SelectTrigger className="h-10">
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
                    
                    {/* Subject */}
                    <div className="space-y-2">
                        <Label className="text-base">Môn học</Label>
                        <Input value={data.subject || ""} disabled className="bg-slate-100 h-10" placeholder="Tự động theo lớp" />
                    </div>
                </div>

                {/* Date Time Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-base">Ngày bắt đầu <span className="text-red-500">*</span></Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      name="startDate"
                      className="h-10"
                      value={data.startDate || ""} 
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-base">Ngày kết thúc <span className="text-red-500">*</span></Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      name="endDate"
                      className="h-10"
                      value={data.endDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                  <Label htmlFor="timeLimit" className="text-base">Thời gian (phút) <span className="text-red-500">*</span></Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    name="timeLimit"
                    className="h-10 md:w-1/3"
                    value={data.timeLimit || ""}
                    placeholder="VD: 45"
                    onChange={handleChange}
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Mô tả đề</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[100px]"
                    placeholder="Ghi chú thêm nếu cần..."
                    value={data.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Upload Section */}
              <Card data-tour="file-upload" className="border-dashed border-2 border-green-500/30 bg-green-50/30 mt-6 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-700 text-lg flex items-center gap-2">
                    <span className="bg-green-100 p-1 rounded">2</span> Tải tài liệu
                  </CardTitle>
                  <CardDescription>
                    Kéo & thả file hoặc chọn từ máy. Hỗ trợ PDF, DOCX...
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

        {/* --- CỘT PHẢI (SETTINGS) --- */}
        <div className="md:col-span-2">
          <Card className="border-green-500/20 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-green-700 text-xl">3) Cấu hình AI</CardTitle>
              <CardDescription>
                Tuỳ chỉnh cách sinh câu hỏi và đầu ra mong muốn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuizSettingsForm />
              <GenerateActions />
            </CardContent>
          </Card>
        </div>
      </section>

      {isGenerating ? <ProcessingScreen /> : null}
    </main>
  );
}