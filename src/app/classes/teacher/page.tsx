"use client";

import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TeacherNotificationBell from "@/components/classDetails/TeacherNotificationToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Users, Plus, Copy, Eye, Settings, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";
import {
  getTeacherClasses,
  createClass,
  getAllSubjects,
  deleteClass,
  updateClass,
} from "@/services/classService";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DropdownNotificationBell from "@/components/classDetails/DropdownNotificationBell";
import SubjectManager from "@/components/classes/SubjectManager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";


// Schema validate form lớp học
const classSchema = yup.object().shape({
  className: yup.string().required("Tên lớp không được để trống"),
  schoolYear: yup
    .number()
    .typeError("Niên khóa phải là số")
    .required("Vui lòng nhập niên khóa")
    .min(2000, "Niên khóa không hợp lệ"),
  semester: yup.string().required("Vui lòng chọn học kỳ"),
  description: yup.string(),
  subjectId: yup.number().required("Vui lòng chọn môn học"),
  joinMode: yup
    .string()
    .oneOf(["AUTO", "APPROVAL"])
    .required("Vui lòng chọn chế độ tham gia lớp"),
});

export default function TeacherClassesPage() {
  const [searchSubject, setSearchSubject] = useState("");
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const uniqueSubjects =
    subjects?.filter(
      (subject, index, self) =>
        subject &&
        subject.id &&
        index === self.findIndex((s) => s && s.id === subject.id)
    ) || [];

  const filteredSubjects = useMemo(() => {
    if (!uniqueSubjects || uniqueSubjects.length === 0) {
      return [];
    }
    return uniqueSubjects.filter((subject) =>
      subject.subjectName.toLowerCase().includes(searchSubject.toLowerCase())
    );
  }, [uniqueSubjects, searchSubject]);
  // Form cho tạo/sửa lớp học
  const classForm = useForm({
    resolver: yupResolver(classSchema),
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      loadClasses(parsedUser.userId, pageNumber);
      loadSubjects();
    }
  }, []);

  const loadClasses = (userId: number, page: number) => {
    getTeacherClasses(userId, page, pageSize)
      .then((res) => {
        setClasses(res.data);
        setPageNumber(res.pageNumber);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy lớp:", err);
        toast.error(
          err?.response?.data?.messages?.[0] ?? "Không thể tải danh sách lớp!"
        );
      });
  };

  const loadSubjects = () => {
    getAllSubjects()
      .then((data) => {
        setSubjects(data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy môn học:", err);
        toast.error(
          err?.response?.data?.messages?.[0] ?? "Không thể tải danh sách lớp!"
        );
      });
  };

  // Hàm mở form tạo mới
  const openCreateModal = () => {
    setEditingClass(null);
    classForm.reset();
    setIsModalOpen(true);
  };

  // Hàm mở form chỉnh sửa
  const openEditModal = async (classItem: any) => {
    setEditingClass(classItem);

    // Đảm bảo subjects đã load xong
    if (subjects.length === 0) {
      await loadSubjects();
    }

    // Delay một chút để đảm bảo state đã update
    setTimeout(() => {
      // Điền dữ liệu vào form
      classForm.reset({
        className: classItem.className,
        schoolYear: classItem.schoolYear,
        semester: classItem.semester,
        description: classItem.description || "",
        subjectId: classItem.subject?.id,
        joinMode: classItem.joinMode,
      });

      setIsModalOpen(true);
    }, 100);
  };

  // Hàm đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    classForm.reset();
  };

  const onSubmitClass = async (data: any) => {
    try {
      if (editingClass) {
        // Cập nhật lớp học
        const payload = {
          ...data,
          id: editingClass.id,
          teacherId: user.userId,
        };

        await updateClass(editingClass.id, payload);
        toast.success("Cập nhật lớp học thành công!");
      } else {
        // Tạo lớp học mới
        const payload = {
          ...data,
          teacherId: user.userId,
        };

        await createClass(payload);
        toast.success("Tạo lớp học thành công!");
      }

      // load lại danh sách lớp
      await loadClasses(user.userId, pageNumber);

      // reset form và đóng modal
      classForm.reset();
      setIsModalOpen(false);
      setEditingClass(null);

    } catch (err: any) {

      console.error(
        editingClass ? "Lỗi cập nhật lớp học:" : "Lỗi tạo lớp học:",
        err
      );
      const backendMessage =
        err?.response?.data?.messages?.[0] ??
        (editingClass ? "Cập nhật lớp học thất bại!" : "Tạo lớp học thất bại!");

      toast.error(backendMessage);

    }
  };

  const handleDeleteClass = async (id: number) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Lớp sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteClass(id);
        await loadClasses(user.userId, pageNumber);
        toast.success("Xóa lớp thành công!");
      } catch {
        Swal.fire("Thất bại!", "Xóa lớp thất bại.", "error");
      }
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã lớp!");
  };

  if (!user) {
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
    );
  }

  const uniqueClasses =
    classes?.filter(
      (classItem, index, self) =>
        classItem &&
        classItem.id &&
        index === self.findIndex((c) => c && c.id === classItem.id)
    ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header + nút tạo lớp, quản lý môn học, thông báo */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                Quản lý lớp học
              </h1>
              <p className="text-gray-600">
                Tạo và quản lý các lớp học của bạn
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DropdownNotificationBell teacherId={user.userId} />

              <SubjectManager
                userId={user.userId}
                subjects={uniqueSubjects}
                reloadSubjects={async () => loadSubjects()}
              />


              <Button
                className="bg-green-700 hover:bg-green-800"
                onClick={openCreateModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo lớp mới
              </Button>
            </div>
          </div>

          {/* Dialog tạo/sửa lớp học */}
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                closeModal();
              }
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-green-700">
                  {editingClass ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
                </DialogTitle>
                <DialogDescription>
                  {editingClass
                    ? "Cập nhật thông tin lớp học"
                    : "Nhập thông tin để tạo lớp học mới"}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={classForm.handleSubmit(onSubmitClass)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="className">Tên lớp</Label>
                  <Input id="className" {...classForm.register("className")} />
                  {classForm.formState.errors.className && (
                    <p className="text-red-500 text-sm">
                      {classForm.formState.errors.className.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolYear">Niên khóa</Label>
                  <Input
                    id="schoolYear"
                    type="number"
                    {...classForm.register("schoolYear")}
                  />
                  {classForm.formState.errors.schoolYear && (
                    <p className="text-red-500 text-sm">
                      {classForm.formState.errors.schoolYear.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Học kỳ</Label>
                  <Select
                    key={`semester-select-${editingClass?.id || "new"}`}
                    value={classForm.watch("semester") || ""}
                    onValueChange={(val) => classForm.setValue("semester", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn học kỳ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Học kỳ 1">Học kỳ 1</SelectItem>
                      <SelectItem value="Học kỳ 2">Học kỳ 2</SelectItem>
                      <SelectItem value="Học kỳ hè">Học kỳ hè</SelectItem>
                    </SelectContent>
                  </Select>
                  {classForm.formState.errors.semester && (
                    <p className="text-red-500 text-sm">
                      {classForm.formState.errors.semester.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...classForm.register("description")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Select
                    key={`subject-select-${editingClass?.id || "new"}`}
                    value={classForm.watch("subjectId")?.toString() || ""}
                    onValueChange={(val) =>
                      classForm.setValue("subjectId", Number(val))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent side="top" className="max-h-60">
                      {/* Ô tìm kiếm với event handling cải thiện */}
                      <div className="p-2 sticky top-0 bg-white z-10 border-b">
                        <Input
                          placeholder="Tìm kiếm môn học..."
                          value={searchSubject}
                          onChange={(e) => setSearchSubject(e.target.value)}
                          onKeyDown={(e) => {
                            // Prevent Select from closing when typing
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            // Prevent Select from closing when clicking on input
                            e.stopPropagation();
                          }}
                          className="h-8"
                        />
                      </div>

                      {/* Danh sách đã filter */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSubjects.length > 0 ? (
                          filteredSubjects.map((subject, index) => (
                            <SelectItem
                              key={`subject-${subject.id}-${index}`}
                              value={subject.id.toString()}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              <div className="flex items-center">
                                <span>{subject.subjectName}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-6 text-center">
                            <div className="text-sm text-gray-500 mb-1">
                              Không tìm thấy môn học
                            </div>
                            <div className="text-xs text-gray-400">
                              Thử từ khóa khác hoặc kiểm tra lại chính tả
                            </div>
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>

                  {classForm.formState.errors.subjectId && (
                    <p className="text-red-500 text-sm">
                      {classForm.formState.errors.subjectId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Chế độ tham gia lớp</Label>
                  <Select
                    key={`joinmode-select-${editingClass?.id || "new"}`}
                    value={classForm.watch("joinMode") || ""}
                    onValueChange={(val) =>
                      classForm.setValue("joinMode", val as "AUTO" | "APPROVAL")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chế độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">
                        Tự động vào (không cần duyệt)
                      </SelectItem>
                      <SelectItem value="APPROVAL">
                        Cần giáo viên duyệt
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {classForm.formState.errors.joinMode && (
                    <p className="text-red-500 text-sm">
                      {classForm.formState.errors.joinMode.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={classForm.formState.isSubmitting}
                >
                  {classForm.formState.isSubmitting
                    ? "Đang xử lý..."
                    : editingClass
                      ? "Cập nhật lớp"
                      : "Tạo lớp"}
                </Button>

                {/* Thêm button hủy */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={closeModal}
                >
                  Hủy
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Danh sách lớp */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueClasses.map((classItem, index) => (
              <Card
                key={`class-${classItem.id}-${index}`}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-green-700 mb-2">
                        {classItem.className}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {classItem.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium shrink-0 ml-3 ${classItem.joinMode === "AUTO"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                    >
                      {classItem.joinMode === "AUTO" ? "Tự động" : "Phê duyệt"}
                    </Badge>
                  </div>

                  {/* Thông tin niên khóa */}
                  <div className="text-sm text-gray-500 border-t pt-3">
                    Niên khóa: {classItem.schoolYear} - {classItem.semester}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Mã lớp */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          MÃ LỚP:
                        </span>
                        <span className="text-sm font-bold text-gray-800 font-mono">
                          #{classItem.id}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 hover:bg-white/80 hover:shadow-sm transition-all"
                        onClick={() => copyClassCode(classItem.id.toString())}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Sao chép</span>
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/classes/${classItem.id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full bg-green-700 hover:bg-green-800 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem lớp
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-9 h-9 p-0 rounded-lg bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-600 hover:text-green-700 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl shadow-lg border border-gray-200 bg-white overflow-hidden"
                        >
                          <DropdownMenuItem
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 cursor-pointer"
                            onClick={() => openEditModal(classItem)}
                          >
                            <Edit3 className="h-4 w-4 mr-3 text-green-600" />
                            Chỉnh sửa lớp
                          </DropdownMenuItem>

                          <div className="my-1 border-t border-gray-200"></div>

                          <DropdownMenuItem
                            className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-3" />
                            Xóa lớp học
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i).map((num) => (
                <Button
                  key={num}
                  variant={num === pageNumber ? "default" : "outline"}
                  onClick={() => loadClasses(user.userId, num)}
                  className={
                    num === pageNumber
                      ? "bg-green-700 hover:bg-green-800 text-white"
                      : "border-green-700 text-green-700 hover:bg-green-50"
                  }
                >
                  {num + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
