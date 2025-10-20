"use client"

import Navigation from "@/components/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Calendar,
  User,
  Download,
  Edit,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import type { Submission, SubmissionStatus } from "@/types/assignment"
import { toast } from 'react-toastify';
import { gradeSubmission, updateGradeSubmission, getSubmissionsByClassId, downloadSubmissionFile, getSubmissionStudentByClass } from "@/services/submissionService"
import { ClassItem } from "@/types/classes"
import { useParams, useRouter } from "next/navigation"
import { getClassById } from "@/services/classService"
import { getFileName } from "@/untils/file"
import { formatDateTime } from "@/untils/dateFormatter"
import UpdateUploadSubmission from "@/components/classDetails/assi/UpdateUploadSubmission"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { publishAssignment } from "@/services/assignmentService"
import { handleViewFile } from "@/untils/fileViewer"

const SubmissionPage = () => {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [score, setScore] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<ClassItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          setUser(parsedUser);
        }
        console.log("Parsed user:", parsedUser);
      } catch (e) {
        console.error("Lỗi parse user:", e);
      }
    }
  }, []);


  const role = user?.roles?.[0] || "student";
  console.log("User role:", role);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classId = Number(params.id)
        console.log("Fetching class data for ID:", classId)

        const data = await getClassById(classId);
        console.log("Classes data:", data);
        setClasses(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu lớp học:", error)
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id]);

  // Fetch submissions bằng API
  useEffect(() => {
    if (!classes || !user) return;
    console.log("Fetching submissions for class:", classes.id, "and user:", user.userId);

    const fetchData = async () => {
      try {
        setLoading(true);

        let data: Submission[] | Submission = [];

        if (role === "teacher") {
          // Giáo viên -> lấy toàn bộ submissions của lớp
          data = await getSubmissionsByClassId(classes.id);
        } else if (role === "student") {
          // Học sinh -> lấy submissions của chính học sinh trong lớp
          data = await getSubmissionStudentByClass(classes.id, user.userId);
        }

        // Nếu backend trả về 1 object thay vì mảng (student chỉ có 1 bài nộp),
        // thì convert thành mảng để table render không bị lỗi
        const normalizedData = Array.isArray(data) ? data : [data];

        setSubmissions(normalizedData);
        setFilteredSubmissions(normalizedData);
        console.log("Fetched submissions:", normalizedData);
      } catch (error) {
        console.error("Lỗi khi lấy submissions:", error);
        toast.error("Không thể tải danh sách bài nộp");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classes, user, role]);

  // Filter submissions based on user role and filters
  useEffect(() => {
    let filtered = submissions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.assignment.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter based on user role
    if (role === "teacher") {
      if (statusFilter === "graded") {
        filtered = filtered.filter((sub) => sub.status === "GRADED")
      } else if (statusFilter === "ungraded") {
        filtered = filtered.filter((sub) => sub.status !== "GRADED")
      }
    } else if (role === "student") {
      // For students, filter by deadline status
      if (statusFilter === "ontime") {
        filtered = filtered.filter((sub) => sub.status !== "LATE")
      } else if (statusFilter === "late") {
        filtered = filtered.filter((sub) => sub.status === "LATE")
      }
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, statusFilter, role])

  const getStatusBadge = (status: SubmissionStatus) => {
    const statusConfig = {
      SUBMITTED: { label: "Đã nộp", variant: "default" as const, icon: Clock },
      GRADED: { label: "Đã chấm", variant: "success" as const, icon: CheckCircle },
      LATE: { label: "Trễ hạn", variant: "destructive" as const, icon: AlertCircle },
      MISSING: { label: "Thiếu bài", variant: "secondary" as const, icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !score) return

    setIsSubmitting(true)
    try {
      const payload = {
        score: Number.parseInt(score),
        comment: comment || undefined,
      }

      const isUpdate = selectedSubmission.status === "GRADED"
      const updatedSubmission = isUpdate
        ? await updateGradeSubmission(selectedSubmission.id, payload)
        : await gradeSubmission(selectedSubmission.id, payload)

      // Update local state
      setSubmissions((prev) => prev.map((sub) => (sub.id === selectedSubmission.id ? updatedSubmission : sub)))

      toast.success(`Đã ${isUpdate ? 'cập nhật' : 'chấm'} điểm: ${score}/10`)

      setGradeDialogOpen(false)
      setScore("")
      setComment("")
      setSelectedSubmission(null)
    } catch (error) {
      toast.error("Không thể cập nhật điểm số")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadSubmission = async (
    submissionId: number,
    filePath: string,
    fileName: string,
    fileType: string
  ) => {
    try {
      // 1. Gọi API tải file (backend trả blob)
      const blob = await downloadSubmissionFile(submissionId);

      // 2. Tạo URL từ blob với đúng MIME type
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: fileType })
      );

      // 3. Dùng tên file gốc từ DB
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      // 4. Xoá sau khi tải
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Tải file thất bại:", error);
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setScore(submission.score?.toString() || "")
    setComment(submission.teacherComment || "")
    setGradeDialogOpen(true)
  }

  // Công bố điểm
  const handlePublishAssignment = async (assignmentId: number) => {
    try {
      await publishAssignment(assignmentId);
      toast.success("Đã công bố điểm cho bài tập!");

      // reload submissions để có assignment.isPublished mới
      if (role === "teacher") {
        const updated = await getSubmissionsByClassId(classes!.id);
        setSubmissions(Array.isArray(updated) ? updated : [updated]);
      } else {
        const updated = await getSubmissionStudentByClass(classes!.id, user.userId);
        setSubmissions(Array.isArray(updated) ? updated : [updated]);
      }
    } catch (err) {
      toast.error("Lỗi khi công bố điểm");
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto p-6 h-96 flex justify-center items-center">
          <DotLottieReact
            src="/animations/loading.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold">Quản lý Bài nộp</h1>
          </div>
          <p className="text-gray-600 ml-2">
            {role === "teacher" ? "Xem và chấm điểm các bài nộp của học sinh" : "Xem lại các bài nộp của bạn"}
          </p>
        </div>

        {role === "teacher" && (() => {
          const grouped: { [key: number]: Submission[] } = {};
          submissions.forEach((sub) => {
            if (!grouped[sub.assignment.id]) grouped[sub.assignment.id] = [];
            grouped[sub.assignment.id].push(sub);
          });

          const readyToPublishAssignments = Object.entries(grouped)
            .filter(([_, subs]) =>
              subs.every((s) => s.status === "GRADED") && !subs[0].assignment.published
            )
            .map(([assignmentId, subs]) => ({
              id: Number(assignmentId),
              title: subs[0].assignment.title,
            }));

          return readyToPublishAssignments.map((ass) => (
            <div key={ass.id} className="mb-4">
              <Button onClick={() => handlePublishAssignment(ass.id)} variant="default" className="cursor-pointer">
                Đã chấm xong - {ass.title}
              </Button>
            </div>
          ));
        })()}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={
                      role === "teacher" ? "Tìm theo tên học sinh hoặc bài tập..." : "Tìm theo tên bài tập..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {role === "teacher" ? (
                      <>
                        <SelectItem value="graded">Đã chấm điểm</SelectItem>
                        <SelectItem value="ungraded">Chưa chấm điểm</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="ontime">Đúng hạn</SelectItem>
                        <SelectItem value="late">Trễ hạn</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Submissions List */}
        <Card>
          <CardContent className="p-0">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có bài nộp nào</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Không tìm thấy bài nộp phù hợp với bộ lọc"
                    : "Chưa có bài nộp nào được tạo"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bài tập</TableHead>
                    {role === "teacher" && <TableHead>Học sinh</TableHead>}
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Tệp đính kèm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Điểm số</TableHead>
                    <TableHead>Nhận xét</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{submission.assignment.title || "Bài nộp không có mô tả"}</span>
                        </div>
                      </TableCell>

                      {role === "teacher" && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {submission.student.fullName}
                          </div>
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className="text-blue-600 cursor-pointer hover:underline"
                          onClick={() => handleViewFile(submission.filePath, submission.fileType)}
                        >
                          {submission.fileName}
                        </span>{" "}
                        ({submission.fileSize})
                      </TableCell>

                      <TableCell>{getStatusBadge(submission.status)}</TableCell>

                      <TableCell>
                        {submission.score !== null ? (
                          role === "teacher" || submission.assignment.published ? (
                            <div className="flex items-center gap-1 font-medium text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {submission.score}/10
                            </div>
                          ) : (
                            <span className="text-gray-400">Chờ công bố</span>
                          )
                        ) : (
                          <span className="text-gray-400">Chưa chấm</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {submission.teacherComment ? (
                          role === "teacher" || submission.assignment.published ? (
                            <div className="max-w-xs truncate" title={submission.teacherComment}>
                              {submission.teacherComment}
                            </div>
                          ) : (
                            <span className="text-gray-400">Chờ công bố</span>
                          )) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    handleDownloadSubmission(submission.id,
                                      submission.filePath,
                                      submission.fileName,
                                      submission.fileType)
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Tải về bài nộp</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {role === "teacher" ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={submission.status === "GRADED" ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => openGradeDialog(submission)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {submission.status === "GRADED"
                                      ? "Chỉnh sửa điểm"
                                      : "Chấm điểm bài nộp"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission); // gán submission đang chọn
                                setViewDialogOpen(true); // mở dialog
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Grade Dialog */}
        <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission?.status === "GRADED" ? "Chỉnh sửa điểm" : "Chấm điểm bài nộp"} - {selectedSubmission?.assignment.title}
              </DialogTitle>
            </DialogHeader>

            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Học sinh:<p className="text-sm text-gray-600">{selectedSubmission.student.fullName}</p></Label>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Nộp lúc:</span>
                    <span>{formatDateTime(selectedSubmission.submittedAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Trạng thái:</span>
                    <span className="capitalize">{selectedSubmission.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mô tả bài nộp</Label>
                  <p className="text-sm text-gray-600">{selectedSubmission.description}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">Điểm số (0-10)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Nhập điểm số"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Nhận xét (tùy chọn)</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Nhập nhận xét cho học sinh..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleGradeSubmission} disabled={!score || isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu điểm"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Bài nộp của bạn - {selectedSubmission?.assignment.title}
              </DialogTitle>
              <DialogDescription>
                Chi tiết bài nộp và điểm số
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <Card className="border">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Bài nộp của bạn</h4>
                      <p className="text-sm text-gray-500">
                        Nộp lúc: {formatDateTime(selectedSubmission.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      {selectedSubmission.status?.toLowerCase() === "graded" ? (
                        selectedSubmission.assignment?.published ? (
                          <div>
                            <Badge className="bg-green-500 mb-1">Đã chấm</Badge>
                            <p
                              className={`text-lg font-bold ${getGradeColor(
                                selectedSubmission.score ?? 0
                              )}`}
                            >
                              {selectedSubmission.score}/10
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="secondary" className="mb-1">Chờ công bố</Badge>
                            <p className="text-sm text-gray-500">Giáo viên chưa công bố điểm</p>
                          </div>
                        )
                      ) : (
                        <Badge variant="secondary">Chờ chấm</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tệp đính kèm:</span>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{selectedSubmission.fileName}</span>
                        <span className="text-gray-500">
                          ({selectedSubmission.fileSize})
                        </span>
                      </div>
                    </div>

                    {selectedSubmission.status === "GRADED" &&
                      selectedSubmission.teacherComment && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Nhận xét:</p>
                          <p className="text-sm text-gray-700">
                            {selectedSubmission.teacherComment ? (
                              role === "teacher" || selectedSubmission.assignment.published ? (
                                <div className="max-w-xs truncate" title={selectedSubmission.teacherComment}>
                                  {selectedSubmission.teacherComment}
                                </div>
                              ) : (
                                <span className="text-gray-400">Chờ công bố</span>
                              )) : (
                              <span className="text-gray-400">Không có</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Chấm bài lúc{" "}
                            {formatDateTime(selectedSubmission.gradedAt)}
                          </p>
                        </div>
                      )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() =>
                          handleDownloadSubmission(
                            selectedSubmission.id,
                            selectedSubmission.filePath,
                            selectedSubmission.fileName,
                            selectedSubmission.fileType
                          )
                        }
                        size="sm"
                        variant="outline"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải về bài nộp
                      </Button>
                      <Button
                        onClick={() => handleViewFile(selectedSubmission.filePath, selectedSubmission.fileType)}
                        size="sm"
                        variant="outline"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Xem file
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

export default SubmissionPage

const getGradeColor = (grade: number) => {
  if (grade >= 9) return "text-green-600";
  if (grade >= 8) return "text-blue-600";
  if (grade >= 6.5) return "text-yellow-600";
  return "text-red-600";
};
