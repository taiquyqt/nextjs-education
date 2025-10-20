"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/classService";
import Swal from "sweetalert2";

const subjectSchema = yup.object().shape({
  subjectName: yup.string().required("Tên môn học không được để trống"),
  description: yup.string().required("Mô tả không được để trống"),
});

interface SubjectManagerProps {
  userId: number;
  subjects: any[];
  reloadSubjects: () => Promise<void>;
}

export default function SubjectManager({
  userId,
  subjects,
  reloadSubjects,
}: SubjectManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  const form = useForm({
    resolver: yupResolver(subjectSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        createdById: userId,
      };

      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
      } else {
        await createSubject(payload);
      }

      await reloadSubjects();
      form.reset();
      setEditingSubject(null);
      setIsOpen(false);
    } catch (err) {
      console.error("Lỗi tạo/cập nhật môn học:", err);
    }
  };

  const handleEdit = (subject: any) => {
    setEditingSubject(subject);
    form.setValue("subjectName", subject.subjectName);
    form.setValue("description", subject.description);
    setIsOpen(true);
  };

  // const handleDelete = async (id: number) => {
  //   if (confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
  //     try {
  //       await deleteSubject(id);
  //       await reloadSubjects();
  //     } catch (err) {
  //       console.error("Lỗi xóa môn học:", err);
  //     }
  //   }
  // };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa môn học này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa ngay",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteSubject(id);
        await reloadSubjects();
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Môn học đã được xóa thành công.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Lỗi xóa môn học:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể xóa môn học. Vui lòng thử lại.",
        });
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingSubject(null);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-green-700 text-green-700 hover:bg-green-50"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Quản lý môn học
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-green-700">
            {editingSubject ? "Sửa môn học" : "Tạo môn học mới"}
          </DialogTitle>
          <DialogDescription>
            {editingSubject
              ? "Cập nhật thông tin môn học"
              : "Nhập thông tin để tạo môn học mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Form tạo/sửa môn học */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mb-6"
          >
            <div className="space-y-2">
              <Label htmlFor="subjectName">Tên môn học</Label>
              <Input id="subjectName" {...form.register("subjectName")} />
              {form.formState.errors.subjectName && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.subjectName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-green-700 hover:bg-green-800">
                {editingSubject ? "Cập nhật" : "Tạo môn học"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
            </div>
          </form>

          {/* Danh sách môn học */}
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Danh sách môn học
            </h3>
            <div className="space-y-2">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <Card key={subject.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-green-700 truncate">
                          {subject.subjectName}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {subject.description}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-4 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(subject)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => handleDelete(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Chưa có môn học nào
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
