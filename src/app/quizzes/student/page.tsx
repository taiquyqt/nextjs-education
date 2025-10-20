"use client";

import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, CheckCircle, Play, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

type StudentQuiz = {
  id: number;
  title: string;
  description?: string | null;
  className?: string | null;
  timeLimit?: number | null;
  totalQuestion?: number | null;
  startDate?: string | null; // "2025-08-30T00:00:00"
  endDate?: string | null; // "2025-08-31T00:00:00"
  subject?: string | null;
  submitted?: boolean; // <-- quan trọng
  score?: number | null; // nếu backend có
};

export default function StudentQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:8080/api/quizzes/student`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const payload = await res.json();
        setQuizzes(payload.data || []);
      } catch (e) {
        console.error("Error fetching quizzes:", e);
      }
    };

    fetchQuizzes();
  }, []);

  const { availableQuizzes, completedQuizzes } = useMemo(() => {
    const available = (quizzes || []).filter((q) => !q.submitted);
    const completed = (quizzes || []).filter((q) => !!q.submitted);
    return { availableQuizzes: available, completedQuizzes: completed };
  }, [quizzes]);

  const getStatusBadge = (
    submitted: boolean | undefined,
    endDate?: string | null
  ) => {
    const now = new Date();
    const due = endDate ? new Date(endDate) : null;

    if (submitted) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Đã nộp
        </Badge>
      );
    }
    if (due && due < now) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          Đã đóng
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500">
        <Clock className="h-3 w-3 mr-1" />
        Đang mở
      </Badge>
    );
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bài kiểm tra trắc nghiệm
            </h1>
            <p className="text-gray-600">Làm bài kiểm tra và xem kết quả</p>
          </div>

          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">Có thể làm</TabsTrigger>
              <TabsTrigger value="completed">Đã nộp</TabsTrigger>
            </TabsList>

            {/* Tab: Có thể làm (chưa nộp) */}
            <TabsContent value="available" className="space-y-4">
              {availableQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-gray-600">
                    Không có bài nào.
                  </CardContent>
                </Card>
              ) : (
                availableQuizzes.map((quiz) => {
                  const totalQuestions = quiz.totalQuestion ?? 0;
                  return (
                    <Card
                      key={quiz.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {quiz.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Lớp {quiz.className} • {quiz.timeLimit} phút •{" "}
                              {totalQuestions} câu hỏi
                            </CardDescription>
                          </div>
                          {getStatusBadge(
                            quiz.submitted,
                            quiz.endDate ?? undefined
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{quiz.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              Thời gian: {quiz.timeLimit} phút
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              Số câu: {totalQuestions}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push(`student/${quiz.id}`)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Bắt đầu làm bài
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Tab: Đã nộp */}
            <TabsContent value="completed" className="space-y-4">
              {completedQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-gray-600">
                    Chưa có bài đã nộp.
                  </CardContent>
                </Card>
              ) : (
                completedQuizzes.map((quiz) => {
                  const scoreText =
                    quiz.score != null ? `Điểm: ${quiz.score}` : undefined;
                  return (
                    <Card
                      key={quiz.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {quiz.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {quiz.className} • Đã nộp
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(true, quiz.endDate ?? undefined)}
                            {scoreText && (
                              <Badge className="bg-green-500">
                                {scoreText}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{quiz.description}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem kết quả
                          </Button>
                          <Button size="sm" variant="outline">
                            Xem đáp án
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
