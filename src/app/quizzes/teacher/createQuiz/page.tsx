"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  Edit,
  LayoutGrid,
  BookOpen,
  FileEdit,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useQuizzStorage } from "../../../../lib/store/useQuizzStorage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Question, QuizzFormData } from "@/types/quiz.type";
import { QuizForm } from "@/components/forms/QuizForm";
import { quizFormSchema } from "@/lib/validation/quizFormSchema";
import { useTeacherClasses } from "../../hook/useTeacherClasses";
import { QuizFormm } from "./QuizForm";
import Navigation from "@/components/navigation";

interface QuizFormDataExtended extends QuizzFormData {
  files: File[];
  fileName: string;
  classId: number;
  createdBy: number;
}
const token = localStorage.getItem("accessToken");
// API response type

interface ApiResponse {
  questions: Question[];
}

// Function to call API and extract questions
const extractQuestionsFromFiles = async (
  files: File[]
): Promise<Question[]> => {
  const formData = new FormData();

  // Add all files to FormData
  files.forEach((file) => {
    formData.append("file", file);
  });
  // hoặc lấy từ context/store

  try {
    const response = await fetch(
      "http://localhost:8080/api/files/extract-questions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    console.log("result :", result);

    return result.questions;
  } catch (error) {
    console.error("Error extracting questions:", error);
    throw error;
  }
};

export default function CreateQuizzPage() {
  const router = useRouter();
  const { setData } = useQuizzStorage();
  const [isLoading, setIsLoading] = useState(false);

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userId = userStr ? JSON.parse(userStr).userId : null;

  const { data: classes = [], isLoading: classesLoading } =
    useTeacherClasses(userId);

  const defaultValues: QuizFormDataExtended = {
    title: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    timeLimit: "40",
    description: "",
    files: [],
    classId: 0,
    createdBy: userId ?? 0,
    fileName: "",
    questions: [],
  };

  const onsubmit = async (data: QuizFormDataExtended) => {
    console.log("Submit data:", data);

    if (!data.files || data.files.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file DOCX");
      return;
    }

    setIsLoading(true);

    try {
      const extractedQuestions = await extractQuestionsFromFiles(data.files);

      if (extractedQuestions.length === 0) {
        toast.error("Không tìm thấy câu hỏi hợp lệ trong file.");
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
        fileName: data.files.map((f) => f.name).join(", "),
        questions: extractedQuestions,
      });

      toast.success(
        `Đã trích xuất thành công ${extractedQuestions.length} câu hỏi!`
      );
      router.push("/quizzes/teacher/preview?mode=create");
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Đã xảy ra lỗi khi xử lý file. Vui lòng thử lại.");
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
            <CardHeader className=" rounded-t-lg p-2">
              <div className="flex items-center space-x-3">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <FileEdit className=" text-blue-600" />
                </div>
                <div className="py-2">
                  <CardTitle className="text-slate-800">
                    Thông tin đề thi
                  </CardTitle>
                  <CardDescription>
                    Nhập thông tin cơ bản cho đề thi mới
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className=" space-y-5">
              <QuizFormm
                defaultValues={defaultValues}
                schema={quizFormSchema}
                onSubmit={onsubmit}
                classOptions={classes}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <div>
            <div className="space-y-5">
              <Card className="hover:shadow-lg transition-shadow border border-green-100">
                <CardContent className=" flex gap-4 items-start">
                  <div className="bg-green-100 p-3 rounded-lg mt-1">
                    <BookOpen className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-800">
                      Tạo đề bằng AI
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Sử dụng Ai để tạo đề dựa vào tài liệu
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
                <CardContent className=" flex gap-4 items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mt-1">
                    <LayoutGrid className="text-purple-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-800">
                      Tạo đề từ Ngân hàng đề
                    </h3>
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
                <CardContent className=" flex gap-4 items-start">
                  <div className="bg-orange-100 p-3 rounded-lg mt-1">
                    <FileText className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-800">
                      Tạo đề offline
                    </h3>
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
    </div>
  );
}
