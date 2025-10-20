"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { differenceInSeconds, format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Trophy,
  Users,
  BookOpen,
  Calendar,
  Timer,
  BarChart2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
interface QuizSubmission {
  id: number;
  quizId: number;
  quizTitle: string;
  subjectName: string;
  className: string;
  studentId: number;
  studentName: string;
  score: number;
  submittedAt: string;
  startAt: string;
  endAt: string;
  gradedAt: string;
}

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [results, setResults] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // hoặc nơi bạn lưu token

        const res = await fetch(
          `http://localhost:8080/api/quiz-submissions/by-quiz/${quizId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setResults(data);
        console.log(data);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 6.5) return "bg-amber-50 text-amber-700 border-amber-200";
    if (score >= 5) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 8) return "emerald";
    if (score >= 6.5) return "amber";
    if (score >= 5) return "orange";
    return "red";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return "🏆";
    if (score >= 6.5) return "⭐";
    if (score >= 5) return "👍";
    return "📚";
  };

  const getUniqueStudentsWithBestScores = () => {
    const studentMap = new Map<number, QuizSubmission>();

    results.forEach((submission) => {
      const existing = studentMap.get(submission.studentId);
      if (
        !existing ||
        submission.score > existing.score ||
        (submission.score === existing.score &&
          new Date(submission.submittedAt) > new Date(existing.submittedAt))
      ) {
        studentMap.set(submission.studentId, submission);
      }
    });

    return Array.from(studentMap.values()).sort((a, b) => b.score - a.score);
  };

  const uniqueStudents = getUniqueStudentsWithBestScores();

  const calculateStats = () => {
    if (uniqueStudents.length === 0)
      return { average: 0, highest: 0, lowest: 0, passRate: 0 };

    const scores = uniqueStudents.map((r) => r.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate =
      (scores.filter((s) => s >= 5).length / scores.length) * 100;

    return { average, highest, lowest, passRate };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
              <span className="text-lg font-medium text-green-700">
                Đang tải kết quả...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  {
    /* Results Table */
  }
  if (!loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto mt-24 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Không có kết quả
          </h2>
          <p className="text-gray-500">
            Chưa có học sinh nào nộp bài cho bài kiểm tra này.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="relative">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')] opacity-20"></div>

            <CardHeader className="relative p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">
                        {results[0]?.quizTitle}
                      </CardTitle>
                      <p className="text-emerald-100 text-sm font-medium mt-1">
                        Kết quả kiểm tra chi tiết
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-emerald-100">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        Môn: {results[0]?.subjectName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        Lớp: {results[0]?.className}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {format(
                          new Date(results[0]?.submittedAt),
                          "dd/MM/yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {uniqueStudents.length}
                    </div>
                    <div className="text-emerald-100 text-sm font-medium">
                      Học sinh tham gia
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Điểm trung bình"
            value={stats.average.toFixed(1)}
            icon={<BarChart2 className="h-5 w-5" />}
            color="bg-emerald-100 text-emerald-700"
            progress={stats.average * 10}
          />

          <StatCard
            title="Điểm cao nhất"
            value={stats.highest.toFixed(1)}
            icon={<Trophy className="h-5 w-5" />}
            color="bg-green-100 text-green-700"
            progress={stats.highest * 10}
          />

          <StatCard
            title="Điểm thấp nhất"
            value={stats.lowest.toFixed(1)}
            icon={<BookOpen className="h-5 w-5" />}
            color="bg-amber-100 text-amber-700"
            progress={stats.lowest * 10}
          />

          <StatCard
            title="Tỷ lệ đạt"
            value={`${stats.passRate.toFixed(0)}%`}
            icon={<Users className="h-5 w-5" />}
            color="bg-teal-100 text-teal-700"
            progress={stats.passRate}
          />
        </div>

        <Card className="border border-green-100 shadow-sm bg-white">
          <CardHeader className="border-b border-green-100 px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span>Kết quả chi tiết</span>
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border border-green-200"
              >
                {uniqueStudents.length} học sinh
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-green-50">
                  <TableRow className="hover:bg-green-50">
                    <TableHead className="w-14 text-center font-semibold text-green-800">
                      STT
                    </TableHead>
                    <TableHead className="font-semibold text-green-800">
                      Học sinh
                    </TableHead>
                    <TableHead className="text-center font-semibold text-green-800">
                      Điểm số
                    </TableHead>
                    <TableHead className="text-center font-semibold text-green-800">
                      Thời gian làm
                    </TableHead>
                    <TableHead className="text-center font-semibold text-green-800">
                      Thời gian nộp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueStudents.map((submission, index) => (
                    <TableRow
                      key={submission.id}
                      className="hover:bg-green-50/50 transition-colors border-b border-green-100"
                    >
                      <TableCell className="text-center font-medium text-gray-600 py-3">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center ${
                            index < 3
                              ? "bg-emerald-100 text-emerald-700 font-bold"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-green-200">
                            <AvatarFallback
                              className={`bg-green-100 text-green-700 font-medium ${
                                index < 3
                                  ? "bg-emerald-100 text-emerald-700"
                                  : ""
                              }`}
                            >
                              {submission.studentName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-gray-800">
                              {submission.studentName}
                            </span>
                            {results.filter(
                              (r) => r.studentId === submission.studentId
                            ).length > 1 && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                {
                                  results.filter(
                                    (r) => r.studentId === submission.studentId
                                  ).length
                                }{" "}
                                lần làm
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center">
                          <Badge
                            variant="secondary"
                            className={`${getScoreColor(
                              submission.score
                            )} font-semibold px-3 py-1 border`}
                          >
                            <span className="mr-1.5">
                              {getScoreIcon(submission.score)}
                            </span>
                            {submission.score.toFixed(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-1 text-gray-600 font-medium">
                          <Timer className="h-4 w-4 text-green-500" />
                          <span>
                            {getMinutesAndSeconds(
                              submission.startAt,
                              submission.endAt
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex flex-col items-center justify-center text-gray-600">
                          <span className="text-sm font-medium">
                            {format(
                              new Date(submission.submittedAt),
                              "dd/MM/yyyy"
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(submission.submittedAt), "HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function getMinutesAndSeconds(start: string, end: string): string {
  const startTime = parseISO(start);
  const endTime = parseISO(end);
  const totalSeconds = differenceInSeconds(endTime, startTime);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}p ${seconds}s`;
}
