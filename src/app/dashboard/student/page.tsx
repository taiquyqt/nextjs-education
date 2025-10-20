"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
  Target,
} from "lucide-react";

import { StudentDashboardResponse } from "@/types/dashboard";
import { fetchStudentDashboard } from "@/services/dashboardService";
import { useRecentScoreOfStudent } from "../hooks/useRecentScoreOfStudent";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { toast } from "react-toastify";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function StudentDashboard() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useRecentScoreOfStudent();

  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard state (kết hợp API + mock)
  const [dashboardData, setDashboardData] = useState<{
    enrolledClasses: number;
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    averageGrade: number;
    upcomingDeadlines: any[];
    recentGrades: any[];
    classProgress: any[];
  }>({
    enrolledClasses: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 8.5,
    upcomingDeadlines: [
      {
        id: 1,
        title: "Bài tập Chương 4 - Hàm số",
        class: "Toán 12A1",
        dueDate: "2024-01-28",
        timeLeft: "3 ngày",
        status: "pending",
      },
      {
        id: 2,
        title: "Kiểm tra giữa kỳ",
        class: "Vật lý 12A1",
        dueDate: "2024-01-30",
        timeLeft: "5 ngày",
        status: "pending",
      },
    ],
    recentGrades: [
      {
        id: 1,
        assignment: "Bài tập Chương 3",
        class: "Toán 12A1",
        grade: 9.0,
        maxGrade: 10,
        date: "2024-01-20",
      },
      {
        id: 2,
        assignment: "Kiểm tra 15 phút",
        class: "Vật lý 12A1",
        grade: 8.5,
        maxGrade: 10,
        date: "2024-01-18",
      },
      {
        id: 3,
        assignment: "Thí nghiệm 1",
        class: "Hóa 12A1",
        grade: 8.0,
        maxGrade: 10,
        date: "2024-01-15",
      },
    ],
    classProgress: [
      {
        class: "Toán 12A1",
        completed: 5,
        total: 6,
        average: 8.8,
      },
      {
        class: "Vật lý 12A1",
        completed: 4,
        total: 5,
        average: 8.2,
      },
      {
        class: "Hóa 12A1",
        completed: 3,
        total: 4,
        average: 8.5,
      },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStudentDashboard()
        .then((data: StudentDashboardResponse) => {
          setDashboardData((prev) => ({
            ...prev,
            enrolledClasses: data.enrolledClasses,
            totalAssignments: data.totalAssignments,
            completedAssignments: data.completedAssignments,
            averageGrade: data.avgScore,
            upcomingDeadlines: data.upcomingDeadlines,
            pendingAssignments:
              data.totalAssignments - data.completedAssignments,
            classProgress: data.classProgress,
          }));
        })
        .catch((error: any) => {
          console.error("Không thể load dashboard student");
          toast.error(
            error?.response?.data?.messages?.[0] ??
              "Không thể load dashboard student"
          );
        })
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem("user");
      router.replace("/auth/login");
    }
  }, [router]);

  const getGradeBadge = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90)
      return <Badge className="bg-green-500">Xuất sắc</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-500">Giỏi</Badge>;
    if (percentage >= 65) return <Badge className="bg-yellow-500">Khá</Badge>;
    if (percentage >= 50)
      return <Badge className="bg-orange-500">Trung bình</Badge>;
    return <Badge variant="destructive">Yếu</Badge>;
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto p-6 h-96 flex justify-center items-center">
          <DotLottieReact src="/animations/loading.lottie" loop autoplay />
        </div>
      </div>
    );
  }
  if (!user) return null;

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "quiz":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "assignment":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "exam":
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "quiz":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "assignment":
        return "bg-green-50 text-green-700 border-green-200";
      case "exam":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user.fullName}!
          </h1>
          <p className="text-gray-600">
            Theo dõi tiến độ học tập và hoàn thành bài tập
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lớp học</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.enrolledClasses}
              </div>
              <p className="text-xs text-muted-foreground">Đang theo học</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.completedAssignments}/
                {dashboardData.totalAssignments}
              </div>
              <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.averageGrade}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.3</span> từ tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ làm</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingAssignments}
              </div>
              <p className="text-xs text-muted-foreground">Bài tập mới</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="#">
                    <Button className="w-full h-20 flex flex-col gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="text-xs">Bài tập</span>
                    </Button>
                  </Link>
                  <Link href="/classes/student">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 bg-transparent"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">Lớp học</span>
                    </Button>
                  </Link>
                  <Link href="/grades/student">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 bg-transparent"
                    >
                      <Award className="h-5 w-5" />
                      <span className="text-xs">Điểm số</span>
                    </Button>
                  </Link>
                  <Link href="/quizzes/student">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 bg-transparent"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">Trắc nghiệm</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hạn nộp sắp tới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{deadline.title}</h4>
                        <Badge variant="outline">{deadline.className}</Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-orange-600">
                          {deadline.daysLeft}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {deadline.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Làm bài</Button>
                      <Button size="sm" variant="outline">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
                {dashboardData.upcomingDeadlines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>Bạn đã hoàn thành tất cả bài tập!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Điểm số gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.map((score, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header with title and score */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(score.type)}
                          <h4 className="font-semibold text-lg">
                            {score.title}
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {score.className}
                        </Badge>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {score.score}/10
                        </div>
                        {getGradeBadge(score.score, 10)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Badge
                        variant="outline"
                        className={`${getTypeColor(score.type)} font-medium`}
                      >
                        {score.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(
                            new Date(score.submittedAt),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!data || data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có kết quả nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tiến độ học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(
                      (dashboardData.completedAssignments /
                        dashboardData.totalAssignments) *
                        100
                    )}
                    %
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hoàn thành tổng thể
                  </p>
                </div>
                <Progress
                  value={
                    (dashboardData.completedAssignments /
                      dashboardData.totalAssignments) *
                    100
                  }
                  className="h-2"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Đã hoàn thành</span>
                    <span className="font-medium">
                      {dashboardData.completedAssignments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chờ làm</span>
                    <span className="font-medium text-orange-600">
                      {dashboardData.pendingAssignments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng cộng</span>
                    <span className="font-medium">
                      {dashboardData.totalAssignments}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tiến độ theo lớp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.classProgress.map((classItem, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{classItem.className}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {classItem.completed}/{classItem.total} bài tập
                        </span>
                        <span>
                          {Math.round(
                            (classItem.completed / classItem.total) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(classItem.completed / classItem.total) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Thành tích
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Hiện tại bạn chưa có thành tích nào!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
