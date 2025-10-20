"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, Users, ArrowLeft, AlertCircle, XCircle, FileCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { getSessionById } from "@/services/classScheduleService";
import { getStudentInClasses } from "@/services/classService";
import { attendanceService } from "@/services/attendanceService";
import { formatDateShort, getDayOfWeek, dayOfWeekMapping } from "@/untils/datetime";
import Navigation from "@/components/navigation";

export default function AttendanceDetailPage() {
  const params = useParams();
  const sessionId = Number(params.sessionId);
  const classId = Number(params.id);

  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionData, studentList, attendanceData] = await Promise.all([
          getSessionById(sessionId),
          getStudentInClasses(classId),
          attendanceService.getAttendanceBySession(sessionId),
        ]);

        setSession(sessionData);
        setStudents(studentList);
        setAttendance(attendanceData || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId, classId]);

  if (loading) {
    return <p className="p-4">Đang tải dữ liệu...</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p>Không tìm thấy thông tin buổi học.</p>
        <Button variant="outline" onClick={() => window.history.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const sessionDate = new Date(session.sessionDate);
  const dayOfWeek = getDayOfWeek(session.sessionDate);

  // Lọc chỉ lấy học sinh vắng hoặc vắng phép
  const absentStudents = attendance.filter(
    (a) => a.status === "ABSENT" || a.status === "EXCUSED"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Chi tiết điểm danh</h1>
            <Badge
              className={
                session.status === "COMPLETED"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }
            >
              {session.status === "COMPLETED" ? "Hoàn thành" : "Chưa hoàn thành"}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{formatDateShort(sessionDate)}</div>
                <div className="text-gray-500">{dayOfWeekMapping[dayOfWeek]}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="font-medium">
                Tiết {session.startPeriod} - {session.endPeriod}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div className="font-medium">{session.location}</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <div className="font-medium">{students.length} sinh viên</div>
            </div>
          </div>
        </Card>

        {/* Danh sách vắng */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sinh viên vắng</h2>
          {absentStudents.length === 0 ? (
            <p className="text-gray-500">Không có sinh viên nào vắng.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absentStudents.map((a, index) => {
                  const student = students.find((s) => s.id === a.studentId);
                  return (
                    <TableRow key={a.studentId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{student?.studentCode}</TableCell>
                      <TableCell>{student?.fullName}</TableCell>
                      <TableCell>
                        {a.status === "ABSENT" ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" /> Vắng mặt
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600">
                            <FileCheck className="h-4 w-4" /> Vắng phép
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{a.note || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
