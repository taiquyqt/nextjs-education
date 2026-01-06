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
import type { QuizFormDataExtended } from "./page";
import { QuizUploadGuide } from "@/app/quizzes/components/QuizUploadGuide";
import { toast } from "sonner";

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
    trigger,
    formState: { errors },
  } = useForm<QuizFormDataExtended>({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const watchedFields = watch();
  
  // --- LOGIC MỚI: TỰ ĐỘNG TÍNH NGÀY KẾT THÚC ---
  // 1. Theo dõi giá trị của ngày bắt đầu và thời lượng
  const watchedStartDate = watch("startDate");
  const watchedTimeLimit = watch("timeLimit");

  // Hàm helper để chuyển Date sang string 'YYYY-MM-DDTHH:mm' (Local time)
  const toLocalISOString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    // Chỉ chạy khi có cả ngày bắt đầu và thời lượng hợp lệ
    if (watchedStartDate && watchedTimeLimit) {
      const start = new Date(watchedStartDate);
      const minutes = Number(watchedTimeLimit);

      if (!isNaN(start.getTime()) && !isNaN(minutes) && minutes > 0) {
        // Tính toán: Thời gian mới = Thời gian cũ + số phút * 60000 (ms)
        const endTime = new Date(start.getTime() + minutes * 60000);
        
        // Format lại thành chuỗi cho input datetime-local
        const endTimeString = toLocalISOString(endTime);

        // Cập nhật giá trị vào form
        setValue("endDate", endTimeString);
      }
    }
  }, [watchedStartDate, watchedTimeLimit, setValue]);
  // --------------------------------------------------

  const onError = (errors: any) => {
    console.log("❌ FORM VALIDATION FAILED:", errors);
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
    setSelectedFiles(selected);
    setValue("files", selected, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
      {/* --- TIÊU ĐỀ --- */}
      <div className="space-y-1">
        <Label htmlFor="title">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Nhập tiêu đề đề thi"
          {...register("title")}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* --- KHỐI LỚP & MÔN HỌC --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="classId">
            Khối lớp <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="classId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : ""}
                onValueChange={(val) => {
                  const numVal = Number(val);
                  field.onChange(numVal);
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

      {/* --- THỜI LƯỢNG (Đưa lên trước để UX tốt hơn khi chỉnh ngày) --- */}
      <div className="space-y-1">
        <Label htmlFor="timeLimit">
          Thời lượng (phút) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="timeLimit"
          type="number"
          placeholder="VD: 45"
          min={1}
          {...register("timeLimit")}
          disabled={isLoading}
        />
        {errors.timeLimit && (
          <p className="text-red-500 text-sm mt-1">{errors.timeLimit.message}</p>
        )}
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
            // Có thể để disabled nếu muốn bắt buộc theo công thức, hoặc để mở để sửa thủ công
            // disabled={true} 
            disabled={isLoading}
          />
        </div>
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

      {/* --- FILE UPLOAD --- */}
      <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
        <Label htmlFor="files" className="font-semibold">
          Tệp PDF <span className="text-red-500">*</span>
        </Label>
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

        {errors.files && (
          <p className="text-red-500 text-sm font-medium">
            {errors.files.message as string}
          </p>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-slate-700">File đã chọn:</p>
            <ul className="text-sm text-green-600 mt-1 space-y-1">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="flex items-center">
                  {file.name}{" "}
                  <span className="text-xs text-gray-400 ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
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