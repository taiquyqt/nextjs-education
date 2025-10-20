"use client";

import { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, Plus, Settings, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Document } from "@/types/document";
import { ClassItem } from "@/types/classes";
import { FieldValues, useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createDocument, deleteDocument, downloadDocument, updateDocument } from "@/services/documentService";
import { formatDateTime } from "@/untils/dateFormatter";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface CreateDocumentFormData {
  title: string;
  description: string | null;
  classId: number;
  file: File | null;
}

interface DocumentTabProps {
  documents: Document[];
  classData: ClassItem[];
}

export const documentSchema = yup.object().shape({
  classId: yup
    .number()
    .typeError("Vui lòng chọn lớp")
    .required("Lớp là bắt buộc"),

  title: yup
    .string()
    .trim()
    .required("Tiêu đề là bắt buộc")
    .max(255, "Tiêu đề không được vượt quá 255 ký tự"),

  description: yup
    .string()
    .optional()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .default("")
    .required("Mô tả là bắt buộc"),

  file: yup
    .mixed<File>()
    .nullable()
    .required()
    .test("fileSize", "Kích thước file tối đa 100MB", (file) =>
      file ? file.size <= 100 * 1024 * 1024 : true
    )
    .test("fileType", "Định dạng file không hợp lệ", (file) =>
      file
        ? [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/jpeg",
          "image/png",
        ].includes(file.type)
        : true
    ),
});

export const DocumentsTab = ({ documents, classData }: DocumentTabProps) => {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateDocumentFormData>({
    resolver: yupResolver(documentSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: undefined,
      file: null,
    },
  });

  const watchedFile = watch("file");
  const watchedClassId = watch("classId");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          setUser(parsedUser);
        }
        console.log("User data loaded:", parsedUser);
      } catch (e) {
        console.error("Lỗi parse user:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (classData) {
      setClasses(Array.isArray(classData) ? classData : [classData]);
    }
  }, [classData]);

  useEffect(() => {
    setDocumentList(documents); // đồng bộ dữ liệu ban đầu từ props
  }, [documents]);

  const handleDeleteDocument = async (id: number) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Tài liệu sẽ bị xóa và không thể khôi phục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa ngay!",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDocument(id);
          setDocumentList((prev) => prev.filter((doc) => doc.id !== id));

          Swal.fire({
            title: "Đã xóa!",
            text: "Tài liệu đã được xóa thành công.",
            icon: "success",
            confirmButtonColor: "#3085d6"
          });
        } catch (error) {
          console.error("Lỗi khi xóa tài liệu:", error);
          Swal.fire({
            title: "Lỗi!",
            text: "Không thể xóa tài liệu. Vui lòng thử lại.",
            icon: "error",
            confirmButtonColor: "#d33"
          });
        }
      }
    });
  };

  const handleEditDocument = (doc: Document) => {
    // Bạn có thể mở lại Dialog upload nhưng set sẵn dữ liệu của doc
    setValue("title", doc.title);
    setValue("description", doc.description || "");
    setValue("classId", doc.classId);
    // file không set lại được (do browser hạn chế), cần upload lại nếu muốn đổi
    setIsDialogOpen(true);

    // lưu state để biết đang edit hay create
    setEditingDoc(doc);
  };

  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const onSubmit = async (data: FieldValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("classId", data.classId.toString());
    formData.append("createdBy", user.userId.toString());
    if (data.file) {
      formData.append("file", data.file);
    }

    try {
      if (editingDoc) {
        // Update
        const updatedDoc = await updateDocument(editingDoc.id, formData);
        setDocumentList((prev) =>
          prev.map((d) => (d.id === editingDoc.id ? updatedDoc : d))
        );
        toast.success("Cập nhật tài liệu thành công!");
        setEditingDoc(null);
      } else {
        // Create
        const newDocument = await createDocument(formData);
        setDocumentList((prev) => [newDocument, ...prev]);
        toast.success("Tạo tài liệu thành công!");
      }

      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      toast.error("Thao tác thất bại.");
    }
  };


  const handleDownload = async (doc: Document) => {
    try {
      // 1. Tăng lượt tải trên backend
      const response = await downloadDocument(doc.id);

      // 2. Cập nhật ngay lượt tải trên UI
      setDocumentList((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? { ...d, downloadCount: (d.downloadCount || 0) + 1 }
            : d
        )
      );

      // Tạo blob từ dữ liệu API trả về
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      // Tạo URL tạm cho blob
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ <a> để tải file
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.title); // tên file tải về
      document.body.appendChild(link);
      link.click();

      // Xóa URL tạm và thẻ link
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
    }
  };

  if (!user) {
    // Đảm bảo không render khi chưa có user
    return (<div>
      <div className="container mx-auto p-6 h-96 flex justify-center items-center">
        <DotLottieReact
          src="/animations/loading.lottie"
          loop
          autoplay
        />
      </div>
    </div>);
  }
  const role = user?.roles?.[0] || "student";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tài liệu lớp học</h3>
        {role === "teacher" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tải lên tài liệu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tải lên tài liệu cho {classes[0]?.className}</DialogTitle>
                <DialogDescription>Chọn tệp tài liệu để chia sẻ với học sinh</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tên tài liệu</Label>
                    <Input id="title" {...register("title")} placeholder="VD: Chương 1 - Giới hạn" />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Mô tả chi tiết về tài liệu..."
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classId">Chọn lớp</Label>
                    <Select
                      onValueChange={(value) => setValue("classId", parseInt(value))}
                      value={watchedClassId ? watchedClassId.toString() : ""}
                    >
                      <SelectTrigger className={errors.classId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn lớp học" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.classId && <p className="text-red-500 text-sm">{errors.classId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Tệp đính kèm</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                      onClick={() => document.getElementById("file")?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Kéo thả tệp hoặc click để chọn</p>
                      <p className="text-sm text-gray-600">Hỗ trợ PDF, Word, PowerPoint</p>
                      <p className="text-xs text-gray-500">Tối đa 50MB</p>
                      {watchedFile && <p className="text-xs text-gray-500 mt-2">{watchedFile.name}</p>}
                    </div>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      {...register("file")}
                      onChange={(e) => {
                        setValue("file", e.target.files?.[0] || null, { shouldValidate: true })
                      }}
                    />
                    {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
                  </div>
                  <Button type="submit" className="w-full">
                    Tải lên
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentList.map((doc) => (
          <Card
            key={doc.id}
            className="rounded-xl border border-gray-200 hover:shadow-md transition-all bg-white"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {doc.fileType && (
                    <span className="text-3xl">
                      {getFileIcon(doc.fileType)}
                    </span>
                  )}
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-800">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 line-clamp-2">
                      {doc.description || "Không có mô tả"}
                    </CardDescription>
                  </div>
                </div>

                {role === "teacher" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                        <Edit className="h-4 w-4 mr-2 text-blue-500" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="space-y-1 mb-3 text-xs text-gray-500">
                <p>📥 Tải lên: {formatDateTime(doc.createdAt)}</p>
                <p>♻️ Cập nhật: {formatDateTime(doc.updatedAt)}</p>
                <p>⬇️ {doc.downloadCount} lượt tải</p>
              </div>

              <Button
                onClick={() => handleDownload(doc)}
                size="sm"
                variant="outline"
                className="w-full rounded-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return "📄";
    case "docx":
      return "📝";
    case "pptx":
      return "📊";
    default:
      return "📁";
  }
};
