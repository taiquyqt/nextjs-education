"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { QuizFormDataExtended } from "./page"; // Đảm bảo đường dẫn import đúng
import { QuizUploadGuide } from "@/app/quizzes/components/QuizUploadGuide"; // Đảm bảo đường dẫn đúng
import { toast } from "sonner"; // Thêm toast để báo lỗi rõ ràng

interface QuizFormProps {
  defaultValues: QuizFormDataExtended;
  schema: any;
  onSubmit: (data: QuizFormDataExtended) => Promise<void> | void;
  classOptions: {
    id: number;
    className: string;
    subject: { id: number; name: string };
  }[];
  isLoading?: boolean;
}

export function QuizFormm({
  defaultValues,
  schema,
  onSubmit,
  classOptions,
  isLoading = false,
}: QuizFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    trigger, // Dùng để kích hoạt validate thủ công
    formState: { errors },
  } = useForm<QuizFormDataExtended>({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange", // Validate ngay khi người dùng nhập liệu
  });

  const watchedFields = watch();

  // Hàm debug lỗi: Sẽ chạy khi form submit thất bại
  const onError = (errors: any) => {
    console.log("❌ FORM VALIDATION FAILED:", errors);
    
    // Hiển thị lỗi cụ thể ra toast để bạn dễ thấy
    if (errors.files) {
        toast.error(`Lỗi File: ${errors.files.message}`);
    } else if (errors.classId) {
        toast.error("Vui lòng chọn lớp học!");
    } else {
        toast.error("Vui lòng kiểm tra lại các trường thông tin màu đỏ!");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    
    // Cập nhật state hiển thị
    setSelectedFiles(selected);
    
    // Cập nhật value cho React Hook Form VÀ kích hoạt validate ngay lập tức
    setValue("files", selected, { shouldValidate: true, shouldDirty: true });
    
    // Debug log xem file đã vào chưa
    console.log("📂 Files selected:", selected);
  };

  return (
    // THÊM onError vào tham số thứ 2 của handleSubmit
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
      
      {/* --- TIÊU ĐỀ --- */}
      <div className="space-y-1">
        <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Nhập tiêu đề đề thi"
          {...register("title")}
          // Bỏ value controlled để tránh conflict, dùng defaultValue nếu cần
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* --- KHỐI LỚP & MÔN HỌC --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="classId">Khối lớp <span className="text-red-500">*</span></Label>
          <Controller
            control={control}
            name="classId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : ""}
                onValueChange={(val) => {
                  const numVal = Number(val);
                  field.onChange(numVal);
                  
                  // Tự động điền môn học
                  const selectedClass = classOptions.find((c) => c.id === numVal);
                  if (selectedClass) {
                    setValue("subject", selectedClass.subject.name);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.classId ? "border-red-500" : ""}>
                  <SelectValue placeholder="-- Chọn lớp học --" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.classId && (
            <p className="text-red-500 text-sm mt-1">{errors.classId.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Môn học</Label>
          <Input
            value={watchedFields.subject ?? "Tự động cập nhật"}
            disabled
            className="bg-slate-100 text-slate-500"
          />
        </div>
      </div>

      {/* --- NGÀY GIỜ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="startDate">Ngày bắt đầu</Label>
          <Input
            id="startDate"
            type="datetime-local"
            {...register("startDate")}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            id="endDate"
            type="datetime-local"
            {...register("endDate")}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* --- THỜI LƯỢNG --- */}
      <div className="space-y-1">
        <Label htmlFor="timeLimit">Thời lượng (phút) <span className="text-red-500">*</span></Label>
        <Input
          id="timeLimit"
          type="number"
          placeholder="VD: 40"
          min={1}
          {...register("timeLimit")}
          disabled={isLoading}
        />
        {errors.timeLimit && (
             <p className="text-red-500 text-sm mt-1">{errors.timeLimit.message}</p>
        )}
      </div>

      {/* --- MÔ TẢ --- */}
      <div className="space-y-1">
        <Label htmlFor="description">Mô tả đề</Label>
        <Textarea
          id="description"
          placeholder="Nhập mô tả cho đề thi..."
          {...register("description")}
          disabled={isLoading}
        />
      </div>

      {/* --- FILE UPLOAD (QUAN TRỌNG NHẤT) --- */}
      <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
        <Label htmlFor="files" className="font-semibold">Tệp PDF <span className="text-red-500">*</span></Label>
        <QuizUploadGuide />
        
        <Input
          id="files"
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="bg-white"
        />
        
        {/* Hiển thị lỗi FILE ở đây */}
        {errors.files && (
          <p className="text-red-500 text-sm font-medium"> {errors.files.message as string}</p>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-2">
             <p className="text-sm font-medium text-slate-700">File đã chọn:</p>
             <ul className="text-sm text-green-600 mt-1 space-y-1">
                {selectedFiles.map((file, idx) => (
                  <li key={idx} className="flex items-center">
                    {file.name} <span className="text-xs text-gray-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                  </li>
                ))}
             </ul>
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 font-bold py-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang xử lý trích xuất câu hỏi...
          </>
        ) : (
          "Tiếp tục"
        )}
      </Button>
    </form>
  );
}