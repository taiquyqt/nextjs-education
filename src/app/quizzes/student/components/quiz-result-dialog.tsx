"use client";

import type React from "react";
import { useRouter } from "next/navigation"; // <--- 1. Import router

import {
  CheckCircle,
  Clock,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Timer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface QuizResultData {
  studentName: string;
  className: string;
  subject: string;
  duration: string;
  startTime: string;
  endTime: string;
  score: number;
  totalQuestions: number;
}
interface QuizResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: QuizResultData;
}

export function QuizResultDialog({
  open,
  onOpenChange,
  data,
}: QuizResultDialogProps) {
  const router = useRouter(); // <--- 2. Khởi tạo router

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const scorePercentage = Math.round((data.score / data.totalQuestions) * 100);
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden"
        style={
          {
            "--backdrop-opacity": "0.8",
            "--backdrop-blur": "4px",
          } as React.CSSProperties
        }
      >
        <DialogHeader className="bg-linear-to-r from-green-600 to-green-700 text-white p-4 ">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <CheckCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Kết quả bài kiểm tra
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-2">
          <Card className="border-green-200">
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Học sinh</p>
                    <p className="font-semibold text-gray-900">
                      {data.studentName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lớp</p>
                    <p className="font-semibold text-gray-900">
                      {data.className}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Môn học</p>
                    <p className="font-semibold text-gray-900">
                      {data.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Timer className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian làm bài</p>
                    <p className="font-semibold text-gray-900">
                      {data.duration}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="text-center">
              <div className="">
                <div
                  className={`text-4xl font-bold mb-2 ${getScoreColor(
                    scorePercentage
                  )}`}
                >
                  {data.score}/10
                </div>
                <Badge
                  variant="secondary"
                  className={`text-lg px-4 py-1 ${
                    scorePercentage >= 80
                      ? "bg-green-100 text-green-800"
                      : scorePercentage >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {scorePercentage}%
                </Badge>
              </div>
              <p className="text-gray-600">
                {scorePercentage >= 80
                  ? "Xuất sắc! Bạn đã làm rất tốt."
                  : scorePercentage >= 60
                  ? "Tốt! Hãy tiếp tục cố gắng."
                  : "Cần cải thiện. Hãy ôn tập thêm nhé!"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-500">Ngày làm bài</span>
                  </div>
                  <span className="font-medium">{formatDate(new Date())}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Bắt đầu</p>
                      <p className="font-medium">{data.startTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Kết thúc</p>
                      <p className="font-medium">{data.endTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
            >
              Xem chi tiết
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                onOpenChange(false); // Đóng popup
                router.push("/quizzes/student"); // <--- 3. Chuyển trang
              }}
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}