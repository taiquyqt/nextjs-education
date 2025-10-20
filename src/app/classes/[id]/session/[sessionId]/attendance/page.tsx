"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Clock3,
  AlertCircle,
  Users,
  FileCheck,
} from "lucide-react";
import {
  formatDateShort,
  getDayOfWeek,
  dayOfWeekMapping,
} from "@/untils/datetime";
import { useParams } from "next/navigation";

import {
  getSessionById,
  updateSessionStatus,
} from "@/services/classScheduleService";
import { getStudentInClasses } from "@/services/classService";
import { attendanceService } from "@/services/attendanceService";
import Navigation from "@/components/navigation";
import { toast } from "react-toastify";

interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface AttendanceRecord {
  sessionId: number;
  studentId: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
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
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED" | "MAKEUP" | "HOLIDAY";
  note?: string;
}

export default function AttendancePage() {
  const params = useParams();
  const sessionId = Number(params.sessionId);
  const classId = Number(params.id);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [session, setSession] = useState<SessionData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<
    AttendanceRecord[]
  >([]);

  // Form states
  const [attendance, setAttendance] = useState<
    Record<number, AttendanceRecord>
  >({});
  const [sessionNote, setSessionNote] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // setIsLoading(true);
        setError(null);

        const [sessionResponse, studentsResponse] = await Promise.all([
          getSessionById(sessionId),
          getStudentInClasses(classId).then((data) => {
            console.log("Classes data:", data);
            setStudents(data);
            return data; // Đảm bảo return data
          }),
        ]);

        const sessionData = sessionResponse;
        setSession(sessionData);
        setSessionNote(sessionData.note || "");

        // Luôn luôn cố gắng fetch existing attendance, bất kể status
        try {
          console.log("Fetching attendance for session:", sessionId);
          const attendanceResponse =
            await attendanceService.getAttendanceBySession(sessionId);
          console.log("Attendance response:", attendanceResponse);

          if (
            Array.isArray(attendanceResponse) &&
            attendanceResponse.length > 0
          ) {
            setExistingAttendance(attendanceResponse);
            console.log("Set existing attendance:", attendanceResponse);
          } else {
            console.log("No existing attendance found");
            setExistingAttendance([]);
          }
        } catch (attendanceError: any) {
          const errorMessage =
            attendanceError?.response?.data?.messages?.[0] ??
            "Error fetching attendance";
          toast.error(errorMessage);
          console.log("Error fetching attendance:", attendanceError);
          setExistingAttendance([]);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);

        const errorMessage =
          err?.response?.data?.messages?.[0] ??
          err?.response?.data?.message ??
          (err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tải dữ liệu");

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId && classId) {
      fetchData();
    }
  }, [sessionId, classId]);

  // Initialize attendance records when students and existing attendance are loaded
  useEffect(() => {
    console.log("Initializing attendance...");
    console.log("Students:", students.length);
    console.log("Existing attendance:", existingAttendance);

    if (students.length > 0) {
      const initialAttendance: Record<number, AttendanceRecord> = {};

      students.forEach((student) => {
        // Kiểm tra existing attendance cho student này
        const existing = existingAttendance.find((a) => {
          console.log(
            `Checking student ${student.id} with attendance record:`,
            a
          );
          return a.studentId === student.id;
        });

        if (existing) {
          console.log(
            `Found existing attendance for student ${student.id}:`,
            existing
          );
          initialAttendance[student.id] = {
            sessionId: existing.sessionId || sessionId,
            studentId: student.id,
            status: existing.status,
            note: existing.note || "",
          };
        } else {
          console.log(
            `No existing attendance for student ${student.id}, setting default`
          );
          initialAttendance[student.id] = {
            sessionId: sessionId,
            studentId: student.id,
            status: "PRESENT",
            note: "",
          };
        }
      });

      console.log("Final initialized attendance:", initialAttendance);
      setAttendance(initialAttendance);
    }
  }, [students, existingAttendance, sessionId]); // Thêm sessionId vào dependency

  // Callbacks for attendance management
  const updateAttendanceStatus = useCallback(
    (studentId: number, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
      setAttendance((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status,
        },
      }));
    },
    []
  );

  const updateAttendanceNote = useCallback(
    (studentId: number, note: string) => {
      setAttendance((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          note,
        },
      }));
    },
    []
  );

  // Kiểm tra xem đã có attendance data chưa
  const hasExistingAttendance = useMemo(() => {
    return existingAttendance.length > 0;
  }, [existingAttendance]);

  // Hoặc kiểm tra session status
  const isAttendanceCompleted = useMemo(() => {
    return session?.status === "COMPLETED" && existingAttendance.length > 0;
  }, [session?.status, existingAttendance]);
  const handleSelectAll = useCallback(
    (status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
      setAttendance((prev) => {
        const newAttendance = { ...prev };
        students.forEach((student) => {
          newAttendance[student.id] = {
            ...newAttendance[student.id],
            status,
          };
        });
        return newAttendance;
      });
    },
    [students]
  );

  const handleSaveAttendance = useCallback(async () => {
    if (isSaving || !session) return;

    setIsSaving(true);
    try {
      const attendanceData = {
        noteSession: sessionNote, // khớp với noteSession trong DTO
        records: Object.values(attendance), // khớp với records trong DTO
      };
      console.log("attendanceData: ", attendanceData);
      const response = await attendanceService.saveAttendance(
        sessionId,
        attendanceData
      );

      if (!response.success) {
        throw new Error(response.message || "Không thể lưu điểm danh");
      }

      // if (session.status === "PENDING" || session.status === "SCHEDULED") {
      //   await updateSessionStatus(sessionId, "COMPLETED");
      //   setSession(prev => prev ? { ...prev, status: "COMPLETED" } : null);
      // }

      toast.success("Điểm danh đã được lưu thành công!");
    } catch (error: any) {
      console.error("Error saving attendance:", error);

      const errorMessage =
        error?.response?.data?.messages?.[0] ??
        error?.response?.data?.message ??
        (error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lưu điểm danh!");

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, attendance, sessionNote, isSaving, session]);

  // Computed values
  const stats = useMemo(() => {
    return students.reduce((acc, student) => {
      const status = attendance[student.id]?.status || "PRESENT";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [students, attendance]);

  const sessionDate = useMemo(
    () => (session ? new Date(session.sessionDate) : new Date()),
    [session?.sessionDate]
  );

  const dayOfWeek = useMemo(
    () => (session ? getDayOfWeek(session.sessionDate) : 0),
    [session?.sessionDate]
  );

  const getStatusIcon = useCallback(
    (status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
      switch (status) {
        case "PRESENT":
          return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case "ABSENT":
          return <XCircle className="h-4 w-4 text-red-600" />;
        case "LATE":
          return <Clock3 className="h-4 w-4 text-yellow-600" />;
        case "EXCUSED":
          return <FileCheck className="h-4 w-4 text-blue-600" />;
      }
    },
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Lỗi tải dữ liệu</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!session || !students.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-blue-800">
              Không tìm thấy dữ liệu
            </h3>
            <p className="text-blue-700 mt-1">
              Không tìm thấy thông tin buổi học hoặc danh sách sinh viên.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Compact Header */}
          <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    Điểm danh buổi học
                  </h1>
                  <Badge
                    variant="secondary"
                    className={`${
                      session.status === "COMPLETED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : session.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    {session.status === "COMPLETED"
                      ? "Hoàn thành"
                      : session.status === "PENDING"
                      ? "Đang diễn ra"
                      : session.status === "SCHEDULED"
                      ? "Đã lên lịch"
                      : "Đã hủy"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll("PRESENT")}
                  disabled={isSaving}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Tất cả có mặt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll("ABSENT")}
                  disabled={isSaving}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Tất cả vắng
                </Button>
              </div>
            </div>

            {/* Session Info */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {formatDateShort(sessionDate)}
                  </div>
                  <div className="text-gray-500">
                    {dayOfWeekMapping[dayOfWeek]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <div className="font-medium text-gray-900">
                  Tiết {session.startPeriod} - {session.endPeriod}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div className="font-medium text-gray-900">
                  {session.location}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <div className="font-medium text-gray-900">
                  {students.length} sinh viên
                </div>
              </div>
            </div>
          </div>

          {/* Compact Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Có mặt</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.PRESENT || 0}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vắng mặt</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.ABSENT || 0}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đi muộn</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.LATE || 0}
                  </p>
                </div>
                <Clock3 className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vắng phép</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.EXCUSED || 0}
                  </p>
                </div>
                <FileCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 md:p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách điểm danh
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead className="w-32">Mã SV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead className="w-40">Trạng thái</TableHead>
                    <TableHead className="w-64">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const attendanceRecord = attendance[student.id];

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.studentCode}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              {student.avatar ? (
                                <img
                                  src={student.avatar}
                                  alt={student.fullName}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {student.fullName}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={attendanceRecord?.status || "PRESENT"}
                            onValueChange={(
                              value: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
                            ) => updateAttendanceStatus(student.id, value)}
                            disabled={isSaving}
                          >
                            <SelectTrigger className="w-36">
                              <div className="flex items-center gap-2">
                                {/* {getStatusIcon(attendanceRecord?.status || "PRESENT")} */}
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
                              <SelectItem value="EXCUSED">
                                <div className="flex items-center gap-2">
                                  <FileCheck className="h-4 w-4 text-blue-600" />
                                  Vắng phép
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Ghi chú..."
                            value={attendanceRecord?.note || ""}
                            onChange={(e) =>
                              updateAttendanceNote(student.id, e.target.value)
                            }
                            className="min-h-[40px] text-sm resize-none"
                            disabled={isSaving}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Session Note */}
          <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Ghi chú buổi học
            </h3>
            <Textarea
              placeholder="Nhập ghi chú cho buổi học này..."
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isSaving}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pb-6">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAttendance}
              // disabled={isSaving || hasExistingAttendance || isAttendanceCompleted}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 min-w-[120px] disabled:bg-gray-400"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Đang lưu...
                </>
              ) : hasExistingAttendance ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cập nhật điểm danh
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
      </div>
    </div>
  );
}
