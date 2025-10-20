"use client"

import { useForm, FieldValues } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Plus } from "lucide-react"
import * as yup from "yup"
import { createAssignment } from "@/services/assignmentService"
import { ClassItem } from "@/types/classes"
import { on } from "events"
import { format } from "date-fns"
import { toast } from "react-toastify"

interface CreateAssignmentFormData {
  title: string
  description: string | null
  dueDate: Date
  maxScore: number
  classId: number
  file: File | null
}

interface CreateAssignmentProps {
  classData: ClassItem[]
  onAssignmentCreated: (newAssignment: any) => void
}

const assignmentSchema = yup.object().shape({
  title: yup.string().required("Tiêu đề là bắt buộc").max(255, "Tối đa 255 ký tự"),
  description: yup.string().nullable().max(2000, "Tối đa 2000 ký tự"),
  dueDate: yup.date().required("Hạn nộp là bắt buộc").min(new Date(), "Hạn nộp phải >= hôm nay"),
  maxScore: yup.number().required("Điểm tối đa là bắt buộc").min(0).typeError("Phải là số"),
  classId: yup.number().required("Lớp là bắt buộc").typeError("Vui lòng chọn một lớp"),
  file: yup.mixed<File>()
    .test("fileSize", "Tệp quá lớn (tối đa 10MB)", value => value ? value.size <= 10 * 1024 * 1024 : true)
    .test("fileType", "Định dạng tệp không hợp lệ", value =>
      value
        ? [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/jpeg",
          "image/png",
        ].includes(value.type)
        : true
    ),
})

export default function CreateAssignment({ classData, onAssignmentCreated }: CreateAssignmentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<CreateAssignmentFormData>({
      resolver: yupResolver(assignmentSchema),
      defaultValues: { title: "", description: "", dueDate: new Date(), maxScore: 10, classId: undefined, file: null },
    })

  const watchedFile = watch("file")
  const watchedClassId = watch("classId")

  const onSubmit = async (data: FieldValues) => {
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("dueDate", format(data.dueDate, "yyyy-MM-dd'T'HH:mm:ss"))
      formData.append("maxScore", data.maxScore.toString())
      formData.append("classId", data.classId.toString())
      if (data.file) formData.append("file", data.file)

      const newAssignment = await createAssignment(formData)
      
      if (onAssignmentCreated) onAssignmentCreated(newAssignment)

    //   onAssignmentCreated(newAssignment)
      reset()
      setIsDialogOpen(false)
      toast.success("Tạo bài tập thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi tạo bài tập.")
    }
  }
  const selectedClass = classData.find(c => c.id === watchedClassId);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Tạo bài tập mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo bài tập cho {selectedClass?.className || "lớp học"}</DialogTitle>
          <DialogDescription>Nhập thông tin bài tập</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input id="title" {...register("title")} placeholder="VD: Bài tập Chương 1" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" {...register("description")} rows={4} placeholder="Mô tả..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Hạn nộp</Label>
            <Input id="dueDate" type="datetime-local" {...register("dueDate", { valueAsDate: true })} />
            {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxScore">Điểm tối đa</Label>
            <Input id="maxScore" type="number" {...register("maxScore", { valueAsNumber: true })} />
            {errors.maxScore && <p className="text-red-500 text-sm">{errors.maxScore.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="classId">Chọn lớp</Label>
            <Select value={watchedClassId?.toString() || ""} onValueChange={v => setValue("classId", parseInt(v))}>
              <SelectTrigger className={errors.classId ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {classData.map(cls => <SelectItem key={cls.id} value={cls.id.toString()}>{cls.className}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.classId && <p className="text-red-500 text-sm">{errors.classId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Tệp đính kèm</Label>
            <div className="border-2 border-dashed p-6 text-center cursor-pointer" onClick={() => document.getElementById("file")?.click()}>
              <Upload className="h-8 w-8 mx-auto mb-2" />
              {watchedFile && <p>{watchedFile.name}</p>}
            </div>
            <input id="file" type="file" className="hidden" onChange={e => setValue("file", e.target.files?.[0] || null)} />
          </div>
          <Button type="submit" className="w-full">Tạo bài tập</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
