"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  UserCheck, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3
} from "lucide-react";
import { formatDateShort, getDayOfWeek, dayOfWeekMapping } from "@/untils/datetime";
import { useParams } from "next/navigation";

interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface AttendanceRecord {
  studentId: number;
  status: "PRESENT" | "ABSENT" | "LATE";
  note?: string;
}

interface SessionData {
  id: number;
  patternId: number;
  classId: number;
  sessionDate: string;
  startPeriod: number;
  endPeriod: number;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED";
  note?: string;
}

interface AttendancePageProps {
  sessionId: number;
  classId: string;
  session: SessionData;
  students: Student[];
  existingAttendance?: AttendanceRecord[];
}

  const mockStudents: Student[] = [
    {
      id: 1,
      studentCode: "21IT001",
      fullName: "Nguyễn Văn An",
      email: "nva@student.edu.vn"
    },
    {
      id: 2,
      studentCode: "21IT002", 
      fullName: "Trần Thị Bình",
      email: "ttb@student.edu.vn"
    },
    {
      id: 3,
      studentCode: "21IT003",
      fullName: "Lê Văn Cường",
      email: "lvc@student.edu.vn"
    }
  ];
  const mockSession: SessionData = {
    id: 1,
    patternId: 1,
    classId: 1,
    sessionDate: "2024-03-15",
    startPeriod: 1,
    endPeriod: 3,
    location: "Phòng A101",
    status: "PENDING",
    note: ""
  };

export default function AttendancePage() {
//   const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({});
//   const [sessionNote, setSessionNote] = useState("");
useParams();
  const sessionId = useParams().sessionId;
  const classId = useParams().id;
  const [isSaving, setIsSaving] = useState(false);
  const students = mockStudents;
  const session = mockSession;
  const existingAttendance: AttendanceRecord[] = [];
  // Memoize initial data để tránh re-render không cần thiết
const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>(() => {
  const initial: Record<number, AttendanceRecord> = {};
  students.forEach(student => {
    const existing = existingAttendance.find(a => a.studentId === student.id);
    initial[student.id] = existing || {
      studentId: student.id,
      status: "PRESENT",
      note: ""
    };
  });
  return initial;
});

const [sessionNote, setSessionNote] = useState(session.note || "");

  // Memoize callbacks để tránh re-render
  const updateAttendanceStatus = useCallback((studentId: number, status: "PRESENT" | "ABSENT" | "LATE") => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  }, []);

  const updateAttendanceNote = useCallback((studentId: number, note: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note
      }
    }));
  }, []);

  const handleSelectAll = useCallback((status: "PRESENT" | "ABSENT" | "LATE") => {
    setAttendance(prev => {
      const newAttendance = { ...prev };
      students.forEach(student => {
        newAttendance[student.id] = {
          ...newAttendance[student.id],
          status
        };
      });
      return newAttendance;
    });
  }, [students]);

  const handleSaveAttendance = useCallback(async () => {
    if (isSaving) return; // Prevent double clicks

    setIsSaving(true);
    try {
      const attendanceData = {
        sessionId,
        attendance: Object.values(attendance),
        sessionNote
      };
      
      console.log("Saving attendance:", attendanceData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Điểm danh đã được lưu thành công!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Có lỗi xảy ra khi lưu điểm danh!");
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, attendance, sessionNote, isSaving]);

  // Memoize computed values
  const stats = useMemo(() => {
    return students.reduce((acc, student) => {
      const status = attendance[student.id]?.status || "PRESENT";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [students, attendance]);

  const sessionDate = useMemo(() => new Date(session.sessionDate), [session.sessionDate]);
  const dayOfWeek = useMemo(() => getDayOfWeek(session.sessionDate), [session.sessionDate]);

  const getStatusIcon = useCallback((status: "PRESENT" | "ABSENT" | "LATE") => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "ABSENT":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "LATE":
        return <Clock3 className="h-4 w-4 text-yellow-600" />;
    }
  }, []);

  // Early return if no data
  if (!session || !students.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại
              </Button>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <UserCheck className="h-5 w-5" />
                Điểm danh buổi học
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll("PRESENT")}
                disabled={isSaving}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Tất cả có mặt
              </Button>
              <Button
                variant="outline"
                size="sm" 
                onClick={() => handleSelectAll("ABSENT")}
                disabled={isSaving}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Tất cả vắng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{formatDateShort(sessionDate)}</div>
                <div className="text-sm text-gray-500">{dayOfWeekMapping[dayOfWeek]}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">Tiết {session.startPeriod} - {session.endPeriod}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{session.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{students.length} sinh viên</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Có mặt</p>
                <p className="text-2xl font-bold text-green-600">{stats.PRESENT || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Vắng mặt</p>
                <p className="text-2xl font-bold text-red-600">{stats.ABSENT || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Đi muộn</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.LATE || 0}</p>
              </div>
              <Clock3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách điểm danh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const attendanceRecord = attendance[student.id];
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.studentCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.fullName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attendanceRecord?.status || "PRESENT"}
                          onValueChange={(value: "PRESENT" | "ABSENT" | "LATE") =>
                            updateAttendanceStatus(student.id, value)
                          }
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-32">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(attendanceRecord?.status || "PRESENT")}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Có mặt
                              </div>
                            </SelectItem>
                            <SelectItem value="ABSENT">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                Vắng mặt
                              </div>
                            </SelectItem>
                            <SelectItem value="LATE">
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-yellow-600" />
                                Đi muộn
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Ghi chú..."
                          value={attendanceRecord?.note || ""}
                          onChange={(e) => updateAttendanceNote(student.id, e.target.value)}
                          className="min-h-[60px] resize-none"
                          disabled={isSaving}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Session Note */}
      <Card>
        <CardHeader>
          <CardTitle>Ghi chú buổi học</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Nhập ghi chú cho buổi học này..."
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            className="min-h-[100px]"
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="bg-green-700 hover:bg-green-800"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu điểm danh
            </>
          )}
        </Button>
      </div>
    </div>
  );
}