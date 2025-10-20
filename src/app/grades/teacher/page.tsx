"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Award,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getCurrentUserId } from "@/untils/utils";
import { useTeacherRanking } from "../hooks/useTeacherRanking";

type UiStudent = {
  id: string | number;
  studentName: string;
  studentEmail: string;
  className: string;
  classId?: number;
  avgGrade: number;
  trend: "up" | "down" | "stable";
  completionRate: number;
  subjects: {
    math?: number;
    literature?: number;
    english?: number;
  };
};

export default function TeacherGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const teacherId = getCurrentUserId();

  useEffect(() => {
    if (!teacherId) {
      router.push("/auth/login");
      return;
    }
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    else setUser({ id: teacherId });
  }, [router, teacherId]);

  const { data: ranking, isLoading, error } = useTeacherRanking(2);

  const apiStudents: UiStudent[] = useMemo(() => {
    if (!ranking) return [];

    // API sample:
    // [
    //   { classId, className, studentName, studentEmail, averageScore }
    // ]
    // Ta sort giảm dần theo averageScore để có "hạng"
    const sorted = [...ranking].sort((a, b) => b.averageScore - a.averageScore);

    // Map sang cấu trúc UI; trend/completionRate/subjects là dữ liệu chưa có -> mặc định.
    return sorted.map((row, idx) => ({
      id: row.studentId ?? `${row.studentEmail}-${idx}`, // fallback nếu backend chưa có studentId
      name: row.studentName ?? row.studentName ?? "Unknown",
      email: row.studentEmail ?? row.studentEmail ?? "",
      className: row.className,
      classId: (row as any).classId, // backend có classId -> giữ
      avgGrade: Number(row.averageScore.toFixed(1)), // API của bạn trả 0..10 hay 0..?? Nếu 0..10 thì bỏ *10
      trend: "stable",
      completionRate: 85,
      subjects: {},
    }));
  }, [ranking]);

  // Danh sách lớp để filter (tạo từ API). Nếu không có data -> rỗng, UI sẽ vẫn render được.
  const classesFromApi = useMemo(() => {
    if (!apiStudents.length) {
      return [{ id: "all", name: "Tất cả lớp", avgGrade: 0, studentCount: 0 }];
    }
    // Group theo classId/className
    const byClass = new Map<
      string,
      { name: string; total: number; sum: number }
    >();

    apiStudents.forEach((s) => {
      const key = s.classId ? String(s.classId) : s.className;
      if (!byClass.has(key)) {
        byClass.set(key, { name: s.className, total: 0, sum: 0 });
      }
      const entry = byClass.get(key)!;
      entry.total += 1;
      entry.sum += s.avgGrade;
    });

    const list = Array.from(byClass.entries()).map(([id, v]) => ({
      id,
      name: v.name,
      avgGrade: Number((v.sum / v.total).toFixed(1)),
      studentCount: v.total,
    }));
    // prepend "all"
    return [
      {
        id: "all",
        name: "Tất cả lớp",
        avgGrade: 0,
        studentCount: apiStudents.length,
      },
      ...list,
    ];
  }, [apiStudents]);

  // Hàm helper (giữ nguyên / có chỉnh nhẹ cho filter động)
  const getFilteredStudents = () => {
    const base = apiStudents.length ? apiStudents : []; // nếu chưa có data thì mảng rỗng
    let filtered = base;

    if (selectedClass !== "all") {
      filtered = filtered.filter((s) => {
        // ưu tiên so classId nếu có, không thì so className
        const key = s.classId ? String(s.classId) : s.className;
        return key === selectedClass;
      });
    }

    // Đang chưa lọc theo môn vì API chưa trả subjects -> giữ nguyên
    return filtered.sort((a, b) => b.avgGrade - a.avgGrade);
  };

  // Các thống kê giữ nguyên nhưng dựa trên dữ liệu mới
  const filteredStudents = getFilteredStudents();
  console.log("filteredStudents :", filteredStudents);

  const distribution = useMemo(() => {
    const excellent = filteredStudents.filter((s) => s.avgGrade >= 9).length;
    const good = filteredStudents.filter(
      (s) => s.avgGrade >= 8 && s.avgGrade < 9
    ).length;
    const average = filteredStudents.filter(
      (s) => s.avgGrade >= 6.5 && s.avgGrade < 8
    ).length;
    const needsImprovement = filteredStudents.filter(
      (s) => s.avgGrade < 6.5
    ).length;
    return { excellent, good, average, needsImprovement };
  }, [filteredStudents]);

  // Vì API chưa trả điểm theo môn -> ta giữ nguyên cách tính cũ nhưng sẽ trả rỗng
  const subjectAverages: any = useMemo(() => {
    if (!filteredStudents.length) return {};
    // Không có dữ liệu theo môn -> tạm ẩn/để undefined
    return {
      math: undefined,
      literature: undefined,
      english: undefined,
    };
  }, [filteredStudents]);

  const trendStats = useMemo(() => {
    return {
      improving: filteredStudents.filter((s) => s.trend === "up").length,
      stable: filteredStudents.filter((s) => s.trend === "stable").length,
      declining: filteredStudents.filter((s) => s.trend === "down").length,
    };
  }, [filteredStudents]);

  const overallAverage =
    filteredStudents.length > 0
      ? (
          filteredStudents.reduce((sum, s) => sum + s.avgGrade, 0) /
          filteredStudents.length
        ).toFixed(1)
      : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: UiStudent["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getGradeBadge = (grade: number) => {
    if (grade >= 9) return <Badge className="bg-green-500">Xuất sắc</Badge>;
    if (grade >= 8) return <Badge className="bg-blue-500">Giỏi</Badge>;
    if (grade >= 6.5) return <Badge className="bg-yellow-500">Khá</Badge>;
    return <Badge variant="destructive">Cần cố gắng</Badge>;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 8) return "text-blue-600";
    if (grade >= 6.5) return "text-yellow-600";
    return "text-red-600";
  };

  if (!teacherId) return null; // đã redirect ở useEffect
  if (isLoading) return <div className="p-6">Đang tải xếp hạng...</div>;
  if (error)
    return <div className="p-6 text-red-600">Lỗi tải dữ liệu xếp hạng</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bảng xếp hạng học sinh
              </h1>
              <p className="text-gray-600">
                Theo dõi và đánh giá sự tiến bộ của học sinh
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {classesFromApi.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subject filter – API chưa có, giữ UI để sau nối */}
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  <SelectItem value="math">Toán học</SelectItem>
                  <SelectItem value="literature">Ngữ văn</SelectItem>
                  <SelectItem value="english">Tiếng Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="ranking">Xếp hạng</TabsTrigger>
              <TabsTrigger value="analysis">Phân tích</TabsTrigger>
            </TabsList>

            {/* ======= OVERVIEW ======= */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tổng học sinh
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredStudents.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Đang theo dõi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Điểm TB chung
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallAverage}</div>
                    <p className="text-xs text-muted-foreground">
                      Trên thang điểm 10
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Học sinh giỏi
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {distribution.excellent + distribution.good}
                    </div>
                    <p className="text-xs text-muted-foreground">≥ 8.0 điểm</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tiến bộ
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {trendStats.improving}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Học sinh cải thiện
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cần chú ý
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {distribution.needsImprovement}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      &lt;6.5 điểm
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top 3 Students */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 3 học sinh xuất sắc</CardTitle>
                  <CardDescription>
                    Những học sinh có thành tích cao nhất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredStudents.slice(0, 3).map((student, index) => (
                      <div
                        key={student.id}
                        className="text-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-center mb-3">
                          {getRankIcon(index + 1)}
                        </div>
                        <Avatar className="h-16 w-16 mx-auto mb-3">
                          <AvatarFallback className="text-lg">
                            {student?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium">{student?.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {student.className}
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className={`text-xl font-bold ${getGradeColor(
                              student.avgGrade
                            )}`}
                          >
                            {student.avgGrade}
                          </span>
                          {getTrendIcon(student.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Class Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Phân bố điểm số</CardTitle>
                    <CardDescription>
                      Số lượng học sinh theo từng mức điểm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {/* Xuất sắc */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Xuất sắc (9.0-10)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  filteredStudents.length
                                    ? (distribution.excellent /
                                        filteredStudents.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {distribution.excellent}
                          </span>
                        </div>
                      </div>

                      {/* Giỏi */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Giỏi (8.0-8.9)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  filteredStudents.length
                                    ? (distribution.good /
                                        filteredStudents.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {distribution.good}
                          </span>
                        </div>
                      </div>

                      {/* Khá */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Khá (6.5-7.9)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  filteredStudents.length
                                    ? (distribution.average /
                                        filteredStudents.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {distribution.average}
                          </span>
                        </div>
                      </div>

                      {/* Cần cố gắng */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Cần cố gắng (&lt;6.5)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  filteredStudents.length
                                    ? (distribution.needsImprovement /
                                        filteredStudents.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {distribution.needsImprovement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thống kê theo lớp (từ API) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thống kê theo lớp</CardTitle>
                    <CardDescription>
                      Điểm trung bình từng lớp học
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classesFromApi
                        .filter((c) => c.id !== "all")
                        .map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{cls.name}</h4>
                              <p className="text-sm text-gray-500">
                                {cls.studentCount} học sinh
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-lg font-bold ${getGradeColor(
                                  cls.avgGrade
                                )}`}
                              >
                                {cls.avgGrade}
                              </div>
                              <p className="text-xs text-gray-500">Điểm TB</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ======= RANKING ======= */}
            <TabsContent value="ranking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bảng xếp hạng chi tiết</CardTitle>
                  <CardDescription>
                    Danh sách tất cả học sinh được sắp xếp theo điểm trung bình
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Hạng</TableHead>
                        <TableHead>Học sinh</TableHead>
                        <TableHead>Lớp</TableHead>
                        <TableHead className="text-center">Điểm TB</TableHead>
                        <TableHead className="text-center">Xu hướng</TableHead>
                        <TableHead className="text-center">
                          Hoàn thành
                        </TableHead>
                        <TableHead className="text-center">Đánh giá</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell className="text-center">
                            {getRankIcon(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {student.studentName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {student.studentName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.studentEmail}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`text-lg font-bold ${getGradeColor(
                                student.avgGrade
                              )}`}
                            >
                              {student.avgGrade}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {getTrendIcon(student.trend)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${student.completionRate}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm">
                                {student.completionRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getGradeBadge(student.avgGrade)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ======= ANALYSIS ======= */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Xu hướng học tập</CardTitle>
                    <CardDescription>
                      Phân tích sự tiến bộ của học sinh
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                        <div>
                          <h4 className="font-medium text-green-800">
                            Tiến bộ
                          </h4>
                          <p className="text-sm text-green-600">
                            Điểm số cải thiện
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {trendStats.improving}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Minus className="h-8 w-8 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-800">Ổn định</h4>
                          <p className="text-sm text-gray-600">
                            Duy trì mức độ hiện tại
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-600">
                        {trendStats.stable}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingDown className="h-8 w-8 text-red-500" />
                        <div>
                          <h4 className="font-medium text-red-800">
                            Cần chú ý
                          </h4>
                          <p className="text-sm text-red-600">Điểm số giảm</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {trendStats.declining}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thành tích theo môn – chưa có dữ liệu chi tiết -> giữ bố cục, ẩn số nếu undefined */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thành tích theo môn</CardTitle>
                    <CardDescription>
                      Điểm trung bình từng môn học
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {["math", "literature", "english"].map((sub) => {
                        const label =
                          sub === "math"
                            ? "Toán học"
                            : sub === "literature"
                            ? "Ngữ văn"
                            : "Tiếng Anh";
                        const val = subjectAverages?.[sub];
                        return (
                          <div
                            key={sub}
                            className="flex items-center justify-between"
                          >
                            <span className="font-medium">{label}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-blue-500 h-3 rounded-full"
                                  style={{
                                    width: val ? `${(val / 10) * 100}%` : "0%",
                                  }}
                                />
                              </div>
                              <span
                                className={`font-bold ${
                                  val ? getGradeColor(val) : "text-gray-400"
                                }`}
                              >
                                {val ?? "--"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích chi tiết</CardTitle>
                  <CardDescription>
                    Thống kê toàn diện về thành tích học tập
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {distribution.excellent}
                      </div>
                      <p className="text-sm text-green-700">Xuất sắc (9.0+)</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {distribution.good}
                      </div>
                      <p className="text-sm text-blue-700">Giỏi (8.0-8.9)</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {distribution.average}
                      </div>
                      <p className="text-sm text-yellow-700">Khá (6.5-7.9)</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {distribution.needsImprovement}
                      </div>
                      <p className="text-sm text-red-700">
                        Cần cố gắng (&lt;6.5)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
