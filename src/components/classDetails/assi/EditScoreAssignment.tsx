"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Assignment, Submission } from "@/types/assignment"
import { updateGradeSubmission } from "@/services/submissionService"
import { toast } from "react-toastify"
import { formatDateTime } from "@/untils/dateFormatter"

interface AssignmentScoreProps {
  submission: Submission
  assignment: Assignment
  onScoreUpdated?: (
    submissionId: number,
    score: number,
    teacherComment: string
  ) => void
}

// Schema validate bằng Yup
const schema = yup.object().shape({
  grade: yup
    .number()
    .typeError("Điểm phải là số")
    .required("Vui lòng nhập điểm")
    .min(0, "Điểm không được nhỏ hơn 0")
    .max(10, "Điểm không được lớn hơn 10"),
  teacherComment: yup
    .string()
    .required("Vui lòng nhập nhận xét")
    .max(500, "Nhận xét tối đa 500 ký tự"),
})

type FormData = yup.InferType<typeof schema>

export default function EditScoreAssignment({
  submission,
  assignment,
  onScoreUpdated,
}: AssignmentScoreProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      grade: submission.score ?? undefined,
      teacherComment: submission.teacherComment ?? "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await updateGradeSubmission(submission.id, {
        score: data.grade,
        comment: data.teacherComment,
      })

      if (onScoreUpdated) {
        onScoreUpdated(submission.id, data.grade, data.teacherComment)
      }

      toast.success("Cập nhật điểm thành công!")
      setIsOpen(false)
    } catch (error) {
      console.error("Lỗi khi cập nhật điểm:", error)
      toast.error("Có lỗi xảy ra khi cập nhật điểm. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Sửa điểm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa điểm - {assignment.title}</DialogTitle>
          <DialogDescription>
            Học sinh: {submission.student.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Chấm lúc:</span>
              <span>{formatDateTime(submission.gradedAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Trạng thái:</span>
              <span className="capitalize">{submission.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-grade">Điểm số (0-10)</Label>
            <Input
              id="edit-grade"
              type="number"
              step="0.1"
              {...register("grade")}
              disabled={isLoading}
            />
            {errors.grade && (
              <p className="text-red-500 text-sm">{errors.grade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-feedback">Nhận xét</Label>
            <Textarea
              id="edit-feedback"
              rows={4}
              {...register("teacherComment")}
              disabled={isLoading}
            />
            {errors.teacherComment && (
              <p className="text-red-500 text-sm">
                {errors.teacherComment.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Cập nhật điểm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
