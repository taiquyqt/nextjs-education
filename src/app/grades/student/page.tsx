"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  FileText,
} from "lucide-react";
import { useStudentResult } from "../hooks/useTeacherRanking";
import { fetchStudentDashboard } from "@/services/dashboardService";
interface OverallStats {
  totalAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  improvement: string;
}

export default function GradesPage() {
  const [user, setUser] = useState<any>(null);
  const { data, isLoading, isError, error } = useStudentResult();
  // Chỉ giữ assignment & quiz
  // const [data?] = useState([
  //   {
  //     id: 1,
  //     subject: "Toán học",
  //     className: "Toán 12A1",
  //     assignments: [
  //       { name: "Bài tập Chương 1", grade: 8.5, maxGrade: 10, type: "assignment", date: "2024-01-15" },
  //       { name: "Kiểm tra 15 phút", grade: 9.0, maxGrade: 10, type: "quiz", date: "2024-01-18" },
  //       { name: "Bài tập Chương 2", grade: 7.5, maxGrade: 10, type: "assignment", date: "2024-01-20" }
  //     ],
  //     average: 8.33,
  //     trend: "up",
  //   },
  //   {
  //     id: 2,
  //     subject: "Vật lý",
  //     className: "Vật lý 12A1",
  //     assignments: [
  //       { name: "Bài tập Động học", grade: 7.0, maxGrade: 10, type: "assignment", date: "2024-01-16" }
  //     ],
  //     average: 7.0,
  //     trend: "up",
  //   },
  //   {
  //     id: 3,
  //     subject: "Hóa học",
  //     className: "Hóa 12A1",
  //     assignments: [
  //       { name: "Bài tập Hóa hữu cơ", grade: 9.0, maxGrade: 10, type: "assignment", date: "2024-01-17" },
  //       { name: "Kiểm tra 15 phút", grade: 8.5, maxGrade: 10, type: "quiz", date: "2024-01-23" }
  //     ],
  //     average: 8.75,
  //     trend: "stable",
  //   },
  // ])

const [overallStats, setOverallStats] = useState<OverallStats>({
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0,
    improvement: "0.3",
  });

  useEffect(() => {
    fetchStudentDashboard()
      .then((data: any) => {
        setOverallStats({
          totalAssignments: data.totalAssignments,
          completedAssignments: data.completedAssignments,
          averageGrade: data.avgScore,
          improvement: "0.3", // mặc định
        });
      });
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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

  const getTypeIcon = (type: string) => {
    if (type === "assignment") return <FileText className="h-4 w-4" />;
    if (type === "quiz") return <BookOpen className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getTypeName = (type: string) => {
    if (type === "assignment") return "Bài tập";
    if (type === "quiz") return "Trắc nghiệm";
    return "Khác";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up")
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down")
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Điểm trung bình
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.averageGrade}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{overallStats.improvement}</span>{" "}
              từ kỳ trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bài tập hoàn thành
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.completedAssignments}/
              {overallStats.totalAssignments}
            </div>
            <Progress
              value={
                (overallStats.completedAssignments /
                  overallStats.totalAssignments) *
                100
              }
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Môn học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.length}</div>
            <p className="text-xs text-muted-foreground">Đang theo học</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ theo môn học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.assignments.length} bài
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">{subject.average}</span>
                  {getTrendIcon(subject.trend)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bài tập gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data
              ?.flatMap((subject) =>
                subject.assignments.map((assignment) => ({
                  ...assignment,
                  subject: subject.subject,
                }))
              )
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 5)
              .map((assignment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(assignment.type)}
                    <div>
                      <p className="font-medium">{assignment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.subject} • {assignment.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      {assignment.grade}/{assignment.maxGrade}
                    </span>
                    {getGradeBadge(assignment.grade, assignment.maxGrade)}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SubjectGradesTab = () => (
    <div className="space-y-6">
      {data?.map((subject) => (
        <Card key={subject.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">{subject.subject}</CardTitle>
                <CardDescription>{subject.className}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{subject.average}</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Điểm TB</span>
                  {getTrendIcon(subject.trend)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bài tập</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Đánh giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subject.assignments.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {assignment.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(assignment.type)}
                        <span className="text-sm">
                          {getTypeName(assignment.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{assignment.date}</TableCell>
                    <TableCell className="font-bold">
                      {assignment.grade}/{assignment.maxGrade}
                    </TableCell>
                    <TableCell>
                      {getGradeBadge(assignment.grade, assignment.maxGrade)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kết quả học tập</h1>
          <p className="text-gray-600">
            Theo dõi điểm số và tiến độ học tập của bạn
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="subjects">Theo môn học</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectGradesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
