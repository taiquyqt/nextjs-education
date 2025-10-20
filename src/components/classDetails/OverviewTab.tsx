"use client"

import { FC, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Upload, CheckCircle, BookOpen, Copy } from "lucide-react"
import Link from "next/link"
import { ClassItem } from "@/types/classes"
import { Submission } from "@/types/assignment"
import { getSubmissionsByClassId, getSubmissionStudentByClass } from "@/services/submissionService"
import { toast } from "react-toastify"

interface OverviewTabProps {
  classData: {
    id: number
    studentCount: number
    code: string
    createdAt: string
    teacher: {
      id: number
      fullName: string
      // có thể thêm email, avatar, v.v nếu cần
    }
    subject: {
      id: number
      name: string
      // có thể thêm email, avatar, v.v nếu cần
    }
  }
  assignments: {
    id: number
    status: "active" | "closed"
  }[]
  documents: any[]
  countstudents: number
  onCopyClassCode: () => void
}

export const OverviewTab: FC<OverviewTabProps> = ({ classData, assignments, documents, countstudents, onCopyClassCode }) => {

  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          setUser(parsedUser);
        }
      } catch (e) {
        console.error("Lỗi parse user:", e);
      }
    }
  }, []);

  const role = user?.roles?.[0] || "student";
  console.log("User role:", role);

  useEffect(() => {
    if (!classData || !user) return;
    console.log("Fetching submissions for class:", classData.id, "and user:", user.userId);

    const fetchData = async () => {
      try {
        let data: Submission[] | Submission = [];

        if (role === "teacher") {
          // Giáo viên -> lấy toàn bộ submissions của lớp
          data = await getSubmissionsByClassId(classData.id);
          console.log("Submissions for teacher:", data);
        } else if (role === "student") {
          // Học sinh -> lấy submissions của chính học sinh trong lớp
          data = await getSubmissionStudentByClass(classData.id, user.userId);
        }
        // thì convert thành mảng để table render không bị lỗi
        const normalizedData = Array.isArray(data) ? data : [data];

        setSubmissions(normalizedData);
        console.log("Fetched submissions:", normalizedData);
      } catch (error) {
        console.error("Lỗi khi lấy submissions:", error);
        toast.error("Không thể tải danh sách bài nộp");
      }
    };

    fetchData();
  }, [classData, user, role]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countstudents}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <Link href={`/classes/${classData.id}/assignment`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Xem bài tập lớp học
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href={`/classes/${classData.id}/submissions`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài nộp</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              { role === "teacher" && <div className="text-2xl font-bold">{submissions.length} / {assignments.length * countstudents}</div>}
              { role === "student" &&<div className="text-2xl font-bold">{submissions.length} / {assignments.length}</div>}
              <p className="text-xs text-muted-foreground">
                Xem tất cả bài nộp
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tài liệu</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Đã tải lên</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nguyễn Văn An đã nộp bài tập</p>
                <p className="text-xs text-muted-foreground">2 giờ trước</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Upload className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Đã tải lên tài liệu mới</p>
                <p className="text-xs text-muted-foreground">1 ngày trước</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Users className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Hoàng Văn Em đã tham gia lớp</p>
                <p className="text-xs text-muted-foreground">3 ngày trước</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin lớp học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Mã lớp:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{classData.id}</span>
                <Button size="sm" variant="ghost" onClick={onCopyClassCode}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Ngày tạo:</span>
              <span className="text-sm">{new Date(classData.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Môn học:</span>
              <span className="text-sm">{classData.subject?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Giáo viên:</span>
              <span className="text-sm">{classData.teacher?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Trạng thái:</span>
              <Badge className="bg-green-500">Đang hoạt động</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
