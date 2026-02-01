"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, LayoutGrid, BookOpen, FileEdit } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuizzStorage } from "../../../../lib/store/useQuizzStorage";
import { QuizFormm } from "./QuizForm";
import { quizFormSchema } from "@/lib/validation/quizFormSchema";
import { useTeacherClasses } from "../../hook/useTeacherClasses";
import Navigation from "@/components/navigation";
import { Question, QuizzFormData } from "@/types/quiz.type";

export interface QuizFormDataExtended extends QuizzFormData {
  files: File[];
  fileName?: string;
  classId: number;
  createdBy: number;
  subject?: string;
}

// Hàm lấy API URL từ biến môi trường
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- HÀM MỚI: Lấy ngày giờ hiện tại đúng định dạng YYYY-MM-DDThh:mm (Local Time) ---
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  // Điều chỉnh offset để lấy giờ địa phương thay vì giờ UTC
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  // Cắt bỏ phần giây và mili-giây, chỉ lấy YYYY-MM-DDThh:mm
  return now.toISOString().slice(0, 16);
};

interface ApiResponse {
  questions: Question[];
  message?: string;
}

const extractQuestionsFromFiles = async (files: File[]): Promise<Question[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("file", file));

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  try {
    const response = await fetch(`${API_URL}/api/files/extract-questions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || `Lỗi server: ${response.status}`);
    }

    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Cấu trúc dữ liệu trả về từ Server không hợp lệ (thiếu field questions).");
    }

    return result.questions;
  } catch (error: any) {
    console.error("Error extracting questions:", error);
    throw error;
  }
};

export default function CreateQuizzPage() {
  const router = useRouter();
  const { setData } = useQuizzStorage();
  const [isLoading, setIsLoading] = useState(false);

  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userId = userStr ? JSON.parse(userStr).userId : 0;

  const { data: classesResponse } = useTeacherClasses(userId);

  const classes = Array.isArray(classesResponse) && classesResponse.length ? classesResponse : [];

  // --- SỬA ĐOẠN NÀY: Dùng hàm getCurrentDateTimeLocal() ---
  const defaultValues: QuizFormDataExtended = {
    title: "",
    startDate: getCurrentDateTimeLocal(), // Lấy giờ hiện tại đúng format
    endDate: getCurrentDateTimeLocal(),   // Lấy giờ hiện tại đúng format
    timeLimit: "45",
    description: "",
    files: [],
    classId: 0,
    createdBy: userId,
    fileName: "",
    questions: [],
    subject: "",
  };

  const onsubmit = async (data: QuizFormDataExtended) => {
    if (!data.files || data.files.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file PDF");
      return;
    }

    setIsLoading(true);

    try {
      const extractedQuestions = await extractQuestionsFromFiles(data.files);

      if (extractedQuestions.length === 0) {
        toast.warning("File đã được xử lý nhưng không tìm thấy câu hỏi nào. Vui lòng kiểm tra định dạng file.");
        return;
      }

      setData({
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        classId: data.classId,
        createdBy: data.createdBy,
        timeLimit: data.timeLimit,
        description: data.description,
        fileName: data.files.map((f) => f.name).join(",") ?? "",
        questions: extractedQuestions,
      });

      toast.success(`Đã trích xuất thành công ${extractedQuestions.length} câu hỏi!`);
      router.push("/quizzes/teacher/preview?mode=create");
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi xử lý file. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGen = () => {
    router.push("/quizzes/teacher/AIgenquiz");
  };

  return (
    <div>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Tạo Đề Thi Mới</h1>
          <p className="text-slate-600 mt-2">
            Lựa chọn phương thức tạo đề thi phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow">
            <CardHeader className="rounded-t-lg p-2">
              <div className="flex items-center space-x-3">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <FileEdit className="text-blue-600" />
                </div>
                <div className="py-2">
                  <CardTitle className="text-slate-800">Thông tin đề thi</CardTitle>
                  <CardDescription>Nhập thông tin cơ bản cho đề thi mới</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <QuizFormm
                defaultValues={defaultValues}
                schema={quizFormSchema}
                onSubmit={onsubmit}
                classOptions={classes}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Các tùy chọn khác giữ nguyên */}
          <div className="space-y-5">
            <Card className="hover:shadow-lg transition-shadow border border-green-100">
              <CardContent className="flex gap-4 items-start">
                <div className="bg-green-100 p-3 rounded-lg mt-1">
                  <BookOpen className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">Tạo đề bằng AI</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Sử dụng AI để tạo đề dựa vào tài liệu
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-green-600 border-green-300 hover:bg-green-50"
                    onClick={handleAIGen}
                  >
                    Tạo đề
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-purple-100">
              <CardContent className="flex gap-4 items-start">
                <div className="bg-purple-100 p-3 rounded-lg mt-1">
                  <LayoutGrid className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">Tạo đề từ Ngân hàng đề</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Tự động sinh đề thi dựa trên ngân hàng đề
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    Tạo đề
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-orange-100">
              <CardContent className="flex gap-4 items-start">
                <div className="bg-orange-100 p-3 rounded-lg mt-1">
                  <FileText className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">Tạo đề offline</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Upload đề thi giấy hoặc nhập thông tin từ file có sẵn
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    Tải lên đề thi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}