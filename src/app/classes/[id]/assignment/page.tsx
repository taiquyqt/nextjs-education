"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Upload, Download, Trash2, ArrowLeft, FileEdit, Eye, FileText, Search, Filter } from "lucide-react"
import type { Assignment, Submission } from "@/types/assignment"
import {
    getAssignments,
    createAssignment,
    createAssignmentFormData,
    downloadAssignmentFile,
    deleteAssignment,
    getAssignmentsByClassId,
} from "@/services/assignmentService"
import { ClassItem } from "@/types/classes"
import { useParams, useRouter } from "next/navigation"
import { getClassById } from "@/services/classService"
import CreateAssignment from "@/components/classDetails/assi/create-assignment"
import { formatDateTime } from "@/untils/dateFormatter"
import Swal from "sweetalert2"
import { getFileName } from "@/untils/file"
import UpdateAssignment from "@/components/classDetails/assi/UpdateAssignment"
import UploadSubmission from "@/components/classDetails/assi/UploadSubmission"
import { downloadSubmissionFile, getSubmissionsByClassId, getSubmissionStudentByClass } from "@/services/submissionService"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import UpdateUploadSubmission from "@/components/classDetails/assi/UpdateUploadSubmission"
import { handleViewFile } from "@/untils/fileViewer"

type FilterType = "all" | "near_deadline" | "overdue" | "open" | "graded" | "ungraded" | "partial" | "submitted" | "not_submitted"

export default function AssignmentsPage() {
    const router = useRouter()
    const params = useParams()
    const [user, setUser] = useState<any>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<FilterType>("all")
    const [statusFilter, setStatusFilter] = useState<FilterType>("all");
    const [progressFilter, setProgressFilter] = useState<string>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [classes, setClasses] = useState<ClassItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!classes || !user) return;
            console.log("Fetching assignment for class:", classes.id);

            try {
                setLoading(true);

                // 1. Lấy danh sách assignments
                const assignmentsData = await getAssignmentsByClassId(classes.id);

                // 2. Lấy submissions
                let submissionsData: Submission[] = [];
                if (role === "student") {
                    const studentSubmissions = await getSubmissionStudentByClass(classes.id, user.userId);
                    submissionsData = Array.isArray(studentSubmissions) ? studentSubmissions : [studentSubmissions];
                    console.log("Student submissions:", submissionsData);
                } else if (role === "teacher") {
                    submissionsData = await getSubmissionsByClassId(classes.id);
                    console.log("Teacher submissions:", submissionsData);
                }

                // 3. Merge submissions vào assignments
                const withSubmissions = assignmentsData.map((assignment: Assignment) => {
                    const relatedSubs = submissionsData.filter(
                        (sub) => sub.assignmentId === assignment.id
                    );
                    return { ...assignment, submissions: relatedSubs };
                });

                console.log("Assignments with submissions:", withSubmissions);
                setAssignments(withSubmissions);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [classes, user, role]);



    useEffect(() => {
        applyFilter()
    }, [assignments, statusFilter, progressFilter, searchTerm])

    const applyFilter = () => {
        let filtered = [...assignments];
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (assignment) =>
                    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    assignment.description.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // 1. Lọc theo trạng thái
        switch (statusFilter) {
            case "near_deadline":
                filtered = filtered.filter(
                    (assignment) => new Date(assignment.dueDate) <= threeDaysFromNow && new Date(assignment.dueDate) > now
                );
                break;
            case "overdue":
                filtered = filtered.filter((assignment) => new Date(assignment.dueDate) < now);
                break;
            case "open":
                filtered = filtered.filter((assignment) => new Date(assignment.dueDate) > threeDaysFromNow);
                break;
        }

        // 2. Lọc theo tình trạng
        if (role === "teacher") {
            switch (progressFilter) {
                case "graded":
                    filtered = filtered.filter((a) => a.submissions?.every((s) => s.status === "GRADED"));
                    break;
                case "ungraded":
                    filtered = filtered.filter((a) => a.submissions?.some((s) => s.status !== "GRADED"));
                    break;
                case "partial":
                    filtered = filtered.filter((a) => {
                        const total = a.submissions?.length || 0;
                        const graded = a.submissions?.filter((s) => s.status === "GRADED").length || 0;
                        return total > 0 && graded > 0 && graded < total;
                    });
                    break;
            }
        } else if (role === "student") {
            switch (progressFilter) {
                case "submitted":
                    filtered = filtered.filter((a) => a.submissions?.some((s) => s.student?.id === user.userId));
                    break;
                case "not_submitted":
                    filtered = filtered.filter((a) => !a.submissions?.some((s) => s.student?.id === user.userId));
                    break;
            }
        }

        setFilteredAssignments(filtered);
    };


    const handleDownloadAssignment = async (
        assignmentId: number,
        filePath: string,
        fileName: string,
        fileType: string
    ) => {
        try {
            // 1. Gọi API tải file (trả blob từ backend)
            const blob = await downloadAssignmentFile(assignmentId);

            // 2. Tạo URL từ blob với type chuẩn
            const url = window.URL.createObjectURL(
                new Blob([blob], { type: fileType })
            );

            // 3. Dùng đúng tên gốc từ DB
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

    const handleDeleteAssignment = async (id: number) => {
        Swal.fire({
            title: "Bạn có chắc chắn bài tập này?",
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteAssignment(id)
                    setAssignments((prev) => prev.filter((assignment) => assignment.id !== id))

                    Swal.fire({
                        title: "Đã xóa!",
                        text: "Bài tập đã được xóa thành công.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    })
                } catch (error) {
                    console.error("Error deleting assignment:", error)
                    Swal.fire({
                        title: "Lỗi!",
                        text: "Không thể xóa bài tập. Vui lòng thử lại.",
                        icon: "error"
                    })
                }
            }
        })
    }

    const getStatusBadge = (assignment: Assignment) => {
        const now = new Date()
        const dueDate = new Date(assignment.dueDate)
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

        if (dueDate < now) {
            return <Badge variant="destructive">Đã hết hạn</Badge>
        } else if (dueDate <= threeDaysFromNow) {
            return <Badge variant="secondary">Gần hết hạn</Badge>
        } else {
            return <Badge variant="success">Đang mở</Badge>
        }
    }

    const getSubmissionStatus = (assignment: Assignment) => {
        if (role === "student") {
            const userSubmission = (assignment.submissions ?? []).find(
                (sub) => sub.student.id === user.userId
            )
            if (userSubmission) {
                return userSubmission.status === "GRADED" ? (
                    <Badge variant="default">Đã chấm</Badge>
                ) : (
                    <Badge variant="secondary">Đã nộp</Badge>
                )
            }
            return <Badge variant="outline">Chưa nộp</Badge>
        }

        if (role === "teacher") {
            const totalSubmissions = assignment.submissions?.length || 0
            const graded = assignment.submissions?.filter(
                (sub) => sub.status === "GRADED"
            ).length || 0
            const ungraded = totalSubmissions - graded

            if (graded > 0 && ungraded === 0) {
                return <Badge variant="default">Đã chấm</Badge>
            }
            if (graded > 0 && ungraded > 0) {
                return (
                    <Badge variant="secondary">
                        Đang chấm {graded}/{totalSubmissions}
                    </Badge>
                );
            }
            if (ungraded > 0) {
                return <Badge variant="secondary">Chưa chấm</Badge>
            }
            return <Badge variant="outline">Chưa nộp</Badge>
        }
        return null
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
        <div>
            <Navigation />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <h1 className="text-3xl font-bold">Quản lý Bài tập</h1>
                    </div>
                    {/* component create assignment */}
                    {role === "teacher" && <CreateAssignment
                        classData={classes ? [classes] : []}
                        onAssignmentCreated={(newAssignment) => setAssignments(prev => [...prev, newAssignment])}
                    />}
                </div>

                {/* Filters */}
                <Card className=" mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm theo bài tập hoặc mô tả..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Bộ lọc trạng thái */}
                            <div className="w-full md:w-48">
                                <Select value={statusFilter} onValueChange={(value: FilterType) => setStatusFilter(value)}>
                                    <SelectTrigger>
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Lọc theo trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Trạng thái</SelectItem>
                                        <SelectItem value="open">Đang mở</SelectItem>
                                        <SelectItem value="near_deadline">Gần hết hạn</SelectItem>
                                        <SelectItem value="overdue">Đã hết hạn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bộ lọc tình trạng */}
                            <div className="w-full md:w-48">
                                <Select value={progressFilter} onValueChange={(value: string) => setProgressFilter(value)}>
                                    <SelectTrigger>
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder={role === "teacher" ? "Lọc theo tình trạng chấm" : "Lọc theo tình trạng nộp"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {role === "teacher" && (
                                            <>
                                                <SelectItem value="all">Tình trạng chấm</SelectItem>
                                                <SelectItem value="graded">Đã chấm</SelectItem>
                                                <SelectItem value="ungraded">Chưa chấm</SelectItem>
                                                <SelectItem value="partial">Đang chấm</SelectItem>
                                            </>
                                        )}
                                        {role === "student" && (
                                            <>
                                                <SelectItem value="all">Tình trạng nộp</SelectItem>
                                                <SelectItem value="submitted">Đã nộp</SelectItem>
                                                <SelectItem value="not_submitted">Chưa nộp</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Assignments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách Bài tập ({filteredAssignments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bài tập</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead>Hạn nộp</TableHead>
                                    {/* <TableHead>Điểm tối đa</TableHead> */}
                                    <TableHead>Tệp đính kèm</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    {role === "teacher" && <TableHead>Tình trạng chấm</TableHead>}
                                    {role === "student" && <TableHead>Tình trạng nộp</TableHead>}
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell className="max-w-xs truncate">{assignment.description}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {formatDateTime(assignment.dueDate)}
                                            </div>
                                        </TableCell>
                                        {/* <TableCell>{assignment.maxScore}</TableCell> */}
                                        <TableCell>
                                            <span
                                                className="text-blue-600 cursor-pointer hover:underline"
                                                onClick={() =>
                                                    handleDownloadAssignment(assignment.id,
                                                        assignment.filePath,
                                                        assignment.fileName,
                                                        assignment.fileType)
                                                }
                                            >
                                                {assignment.fileName}
                                            </span>{" "}
                                            ({assignment.fileSize})
                                        </TableCell>
                                        <TableCell>{getStatusBadge(assignment)}</TableCell>
                                        {role === "teacher" && <TableCell>{getSubmissionStatus(assignment)}</TableCell>}
                                        {role === "student" && <TableCell>{getSubmissionStatus(assignment)}</TableCell>}
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {role === "teacher" && (
                                                    <div className="flex gap-2">
                                                        {/* Chỉnh sửa */}
                                                        <UpdateAssignment
                                                            assignment={assignment}
                                                            classData={classes ? [classes] : []}
                                                            onSuccess={(updated) => {
                                                                setAssignments((prev) =>
                                                                    prev.map((item) => (item.id === updated.id ? updated : item))
                                                                )
                                                            }}
                                                        />

                                                        {/* Xóa */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Xóa bài tập</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                )}

                                                {role === "student" && (
                                                    <div>
                                                        {assignment.submissions && assignment.submissions.length > 0 ? (
                                                            // Nếu đã nộp -> nút "Xem lại bài nộp"
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        Xem lại bài nộp
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-2xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Bài nộp của bạn - {assignment.title}</DialogTitle>
                                                                        <DialogDescription>
                                                                            Chi tiết bài nộp và điểm số
                                                                        </DialogDescription>
                                                                    </DialogHeader>

                                                                    {assignment.submissions.map((submission) => (
                                                                        <Card key={submission.id} className="border">
                                                                            <CardHeader className="pb-3">
                                                                                <div className="flex justify-between items-start">
                                                                                    <div>
                                                                                        <h4 className="font-medium">Bài nộp của bạn</h4>
                                                                                        <p className="text-sm text-gray-500">
                                                                                            Nộp lúc: {formatDateTime(submission.submittedAt)}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        {submission.status?.toLowerCase() === "graded" ? (
                                                                                            submission.assignment?.published ? (
                                                                                                <div>
                                                                                                    <Badge className="bg-green-500 mb-1">Đã chấm</Badge>
                                                                                                    <p
                                                                                                        className={`text-lg font-bold ${getGradeColor(
                                                                                                            submission.score ?? 0
                                                                                                        )}`}
                                                                                                    >
                                                                                                        {submission.score}/10
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
                                                                                            <span>{submission.fileName}</span>
                                                                                            <span className="text-gray-500">
                                                                                                ({submission.fileSize})
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {submission.status === "GRADED" &&
                                                                                        submission.teacherComment && (
                                                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                                                <p className="text-sm font-medium mb-1">Nhận xét:</p>
                                                                                                <p className="text-sm text-gray-700">
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
                                                                                                </p>
                                                                                                <p className="text-xs text-gray-500 mt-2">
                                                                                                    Chấm lúc {formatDateTime(submission.gradedAt)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                    <div className="flex gap-2 pt-2">
                                                                                        <Button
                                                                                            onClick={() =>
                                                                                                handleDownloadSubmission(
                                                                                                    submission.id,
                                                                                                    submission.filePath,
                                                                                                    submission.fileName,
                                                                                                    submission.fileType
                                                                                                )
                                                                                            }
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                        >
                                                                                            <Download className="h-3 w-3 mr-1" />
                                                                                            Tải về
                                                                                        </Button>
                                                                                        <Button
                                                                                            onClick={() => handleViewFile(submission.filePath, submission.fileType)}
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                        >
                                                                                            <FileText className="h-3 w-3 mr-1" />
                                                                                            Xem file
                                                                                        </Button>
                                                                                        {/* update submission */}
                                                                                        <UpdateUploadSubmission
                                                                                            submission={submission}
                                                                                            assignment={assignment}
                                                                                            onSuccess={(updated) => {
                                                                                                // Cập nhật lại state submissions sau khi chỉnh sửa thành công
                                                                                                setAssignments((prev) =>
                                                                                                    prev.map((a) =>
                                                                                                        a.id === assignment.id
                                                                                                            ? {
                                                                                                                ...a,
                                                                                                                submissions: a.submissions?.map((s) =>
                                                                                                                    s.id === updated.id ? updated : s
                                                                                                                ) || [],
                                                                                                            }
                                                                                                            : a
                                                                                                    )
                                                                                                );
                                                                                            }}
                                                                                            disabled={submission.status?.toUpperCase() === "GRADED"}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                    ))}
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : (
                                                            // Nếu chưa nộp -> nút "Nộp bài"
                                                            <UploadSubmission
                                                                assignment={assignment}
                                                                onSuccess={(newSubmission) => {
                                                                    setAssignments((prev) =>
                                                                        prev.map((item) =>
                                                                            item.id === assignment.id
                                                                                ? {
                                                                                    ...item,
                                                                                    submissions: [...(item.submissions || []), newSubmission],
                                                                                }
                                                                                : item
                                                                        )
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 8) return "text-blue-600";
    if (grade >= 6.5) return "text-yellow-600";
    return "text-red-600";
};
