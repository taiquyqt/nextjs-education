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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Clock,
  Users,
  CheckCircle,
  Edit,
  Eye,
  Search,
  Filter,
  Calendar,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuizzesQuery } from "../hooks";
import { TeacherQuizSkeleton } from "../components/TeacherQuizSkeleton";
import { DataState } from "@/components/DataState";
import { QuizCard } from "@/types/quiz.type";

type QuizStatus = "upcoming" | "active" | "closed";

export default function TeacherQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<QuizStatus>("active");

  const {
    data: quizzes = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuizzesQuery();

  // Lấy danh sách unique subjects và classes
  const { subjects, classes } = useMemo(() => {
    const subjectSet = new Set<string>();
    const classSet = new Set<string>();

    quizzes.forEach((quiz: QuizCard) => {
      if (quiz.subject) subjectSet.add(quiz.subject);
      if (quiz.className) classSet.add(quiz.className);
    });

    return {
      subjects: Array.from(subjectSet).sort(),
      classes: Array.from(classSet).sort(),
    };
  }, [quizzes]);

  // Hàm xác định trạng thái quiz
  const getQuizStatus = (quiz: QuizCard): QuizStatus => {
    try {
      const now = new Date();
      const startDate = new Date(quiz.startDate);
      const endDate = new Date(quiz.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "closed";
      }

      if (startDate > now) return "upcoming";
      if (startDate <= now && endDate >= now) return "active";
      return "closed";
    } catch (error) {
      return "closed";
    }
  };

  // Lọc quizzes theo search và filters
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz: QuizCard) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject =
        selectedSubject === "all" || quiz.subject === selectedSubject;
      const matchesClass =
        selectedClass === "all" || quiz.className === selectedClass;

      return matchesSearch && matchesSubject && matchesClass;
    });
  }, [quizzes, searchTerm, selectedSubject, selectedClass]);

  // Nhóm quizzes theo class và status
  const quizzesByClassAndStatus = useMemo(() => {
    const grouped: {
      [className: string]: {
        [status in QuizStatus]: QuizCard[];
      };
    } = {};

    filteredQuizzes.forEach((quiz: QuizCard) => {
      const className = quiz.className || "Không có lớp";
      const status = getQuizStatus(quiz);

      if (!grouped[className]) {
        grouped[className] = {
          upcoming: [],
          active: [],
          closed: [],
        };
      }

      grouped[className][status].push(quiz);
    });

    // Sắp xếp quizzes trong mỗi group theo ngày
    Object.keys(grouped).forEach((className) => {
      Object.keys(grouped[className]).forEach((status) => {
        grouped[className][status as QuizStatus].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      });
    });

    return grouped;
  }, [filteredQuizzes]);

  // Đếm tổng số quiz theo status
  const statusCounts = useMemo(() => {
    const counts = { upcoming: 0, active: 0, closed: 0 };

    Object.values(quizzesByClassAndStatus).forEach((classData) => {
      counts.upcoming += classData.upcoming.length;
      counts.active += classData.active.length;
      counts.closed += classData.closed.length;
    });

    return counts;
  }, [quizzesByClassAndStatus]);

  const getStatusBadge = (quiz: QuizCard) => {
    const status = getQuizStatus(quiz);

    switch (status) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Sắp diễn ra
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Đang mở
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="destructive">
            <Clock className="h-3 w-3 mr-1" />
            Đã đóng
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Không xác định
          </Badge>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleXemKetQua = (quizId: number) => {
    router.push(`teacher/quizResult/${quizId}`);
  };

  // Render quiz cards cho một status cụ thể
  const renderQuizCards = (quizzes: QuizCard[]) => {
    return (
      // Hiển thị 3 cards trên 1 hàng
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz: any) => (
          <Card key={quiz.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{quiz.subject}</span>
                {getStatusBadge(quiz)}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {quiz.timeLimit} phút • {quiz.totalQuestions} câu
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {quiz.studentsSubmitted}/{quiz.totalStudents} đã làm
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {getQuizStatus(quiz) === "upcoming"
                  ? `Bắt đầu: ${formatDateTime(quiz.startDate)}`
                  : `Hết hạn: ${formatDateTime(quiz.endDate)}`}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleXemKetQua(quiz.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Kết quả
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`teacher/preview?mode=edit&id=${quiz.id}`)
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // --- RETURN CHÍNH (Đã bỏ component con TeacherQuizView) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DataState
          isLoading={isLoading}
          error={error}
          skeleton={<TeacherQuizSkeleton />}
          onRetry={() => refetch()}
          variant="card"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý trắc nghiệm
                </h1>
                <p className="text-gray-600">
                  Tạo và theo dõi bài kiểm tra trắc nghiệm
                </p>
              </div>
              <Link href="teacher/createQuiz">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài kiểm tra mới
                </Button>
              </Link>
            </div>

            {/* Filter & Search Bar */}
            <Card className="bg-white">
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm theo tên bài kiểm tra..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="min-w-[200px]">
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả môn học</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[200px]">
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp học</SelectItem>
                        {classes.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs theo Status */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as QuizStatus)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Đang mở ({statusCounts.active})
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Sắp diễn ra ({statusCounts.upcoming})
                </TabsTrigger>
                <TabsTrigger value="closed" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Đã đóng ({statusCounts.closed})
                </TabsTrigger>
              </TabsList>

              {/* Content cho từng tab */}
              {(["active", "upcoming", "closed"] as QuizStatus[]).map(
                (status) => (
                  <TabsContent key={status} value={status} className="mt-6">
                    {Object.keys(quizzesByClassAndStatus).length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-500 text-lg">
                            Không tìm thấy bài kiểm tra nào
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Thử thay đổi bộ lọc hoặc tạo bài kiểm tra mới
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-8">
                        {Object.entries(quizzesByClassAndStatus).map(
                          ([className, classData]) => {
                            const quizzesForStatus = classData[status];

                            // Chỉ hiển thị class nếu có quiz trong status này
                            if (quizzesForStatus.length === 0) return null;

                            return (
                              <div key={className} className="space-y-4">
                                {/* Class Header */}
                                <div className="flex items-center gap-3">
                                  <h2 className="text-2xl font-semibold text-gray-800">
                                    Lớp {className}
                                  </h2>
                                  <Badge variant="outline" className="text-sm">
                                    {quizzesForStatus.length} bài kiểm tra
                                  </Badge>
                                </div>

                                {renderQuizCards(quizzesForStatus)}
                              </div>
                            );
                          }
                        )}

                        {/* Hiển thị message nếu không có quiz nào trong status này */}
                        {Object.values(quizzesByClassAndStatus).every(
                          (classData) => classData[status].length === 0
                        ) && (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <p className="text-gray-500 text-lg">
                                Không có bài kiểm tra{" "}
                                {status === "active"
                                  ? "đang mở"
                                  : status === "upcoming"
                                  ? "sắp diễn ra"
                                  : "đã đóng"}
                              </p>
                              <p className="text-gray-400 text-sm mt-2">
                                Thử thay đổi bộ lọc hoặc tạo bài kiểm tra mới
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>

            {isFetching && (
              <div className="text-sm text-gray-500 text-center py-4">
                Đang đồng bộ dữ liệu…
              </div>
            )}
          </div>
        </DataState>
      </div>
    </div>
  );
}