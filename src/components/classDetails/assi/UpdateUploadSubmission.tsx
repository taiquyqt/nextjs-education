import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Assignment, Submission } from '@/types/assignment'
import { FileEdit, Upload, FileText, Download } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FieldValues } from "react-hook-form"
import { createUpdateSubmissionFormData, updateSubmission, downloadSubmissionFile } from '@/services/submissionService'
import { toast } from 'react-toastify'
import { getFileName } from '@/untils/file'

interface UpdateSubmissionProps {
    submission: Submission;
    assignment: Assignment;
    onSuccess?: (submission: Submission) => void;
    disabled?: boolean;
}

interface UpdateSubmissionFormData {
    description: string | null
    file: File | null
}

const updateSchema = yup.object().shape({
    description: yup.string().nullable().optional().max(500, 'Mô tả không được vượt quá 500 ký tự'),
    file: yup.mixed<File>()
        .test("fileSize", "Tệp quá lớn (tối đa 10MB)", (value) => value ? value.size <= 10 * 1024 * 1024 : true)
        .test("fileType", "Định dạng tệp không hợp lệ", (value) => {
            return value ? [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "image/jpeg",
                "image/png",
            ].includes(value.type) : true
        }),
});

export default function UpdateUploadSubmission({ submission, assignment, onSuccess, disabled = false, }: UpdateSubmissionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<UpdateSubmissionFormData>({
        resolver: yupResolver(updateSchema),
        defaultValues: {
            description: submission?.description || "",
            file: null,
        },
    })

    const watchedFile = watch("file")

    useEffect(() => {
        if (submission) {
            reset({
                description: submission.description || "",
                file: null
            })
        }
    }, [submission, reset])

    const onSubmit = async (data: FieldValues) => {
        try {
            const formData = createUpdateSubmissionFormData({
                file: data.file || undefined,
                description: data.description || undefined,
            })

            const updated = await updateSubmission(submission.id, formData)
            if (onSuccess) {
                onSuccess(updated)
            }

            reset()
            setIsDialogOpen(false)
            toast.success("Chỉnh sửa bài nộp thành công!")
        } catch (error) {
            console.error("Có lỗi khi chỉnh sửa bài nộp:", error)
            toast.error("Có lỗi khi chỉnh sửa bài nộp.")
        }
    }

    const handleDownload = async (filePath: string) => {
        try {
            const blob = await downloadSubmissionFile(submission.id)
            const url = window.URL.createObjectURL(blob)
            const fileName = getFileName(filePath);
            const a = document.createElement("a")
            a.href = url
            a.setAttribute("download", fileName);
            document.body.appendChild(a);
            a.click()
            a.parentNode?.removeChild(a);
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error("Lỗi khi tải file cũ:", err)
            toast.error("Không thể tải file cũ")
        }
    }

    const isOverdue = new Date(assignment.dueDate) < new Date();

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"
                    disabled={disabled || isOverdue}
                    className={(disabled || isOverdue) ? "opacity-50 cursor-not-allowed" : ""}>
                    <FileEdit className="h-4 w-4 mr-1" />
                    {isOverdue ? "Hết hạn chỉnh sửa" : "Chỉnh sửa bài nộp"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa bài nộp - {assignment.title}</DialogTitle>
                    <DialogDescription>
                        Bạn có thể thay đổi file hoặc cập nhật mô tả cho bài nộp này.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Hiển thị file cũ */}
                        {submission.filePath && !watchedFile && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FileText className="h-4 w-4" />
                                <span>{submission.fileName}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleDownload(submission.filePath ?? "")}>
                                    <Download className="h-3 w-3 mr-1" /> Tải file cũ
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="file">Thay thế tệp đính kèm (tùy chọn)</Label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                                onClick={() => document.getElementById("update-file")?.click()}
                            >
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Kéo thả tệp hoặc click để chọn</p>
                                {/* Nếu user chọn file mới */}
                                {watchedFile && <p className="text-xs text-gray-500 mt-2">{watchedFile.name}</p>}

                                {/* Nếu chưa chọn file mới thì hiển thị file cũ */}
                                {!watchedFile && submission.filePath && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        File hiện tại: <span className="underline">{submission.fileName}</span>
                                    </p>
                                )}
                            </div>
                            <input
                                id="update-file"
                                type="file"
                                className="hidden"
                                {...register("file")}
                                onChange={(e) => {
                                    setValue("file", e.target.files?.[0] || null, { shouldValidate: true })
                                }}
                            />
                            {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Cập nhật mô tả</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Cập nhật ghi chú mô tả cho bài làm..."
                                rows={4}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                        </div>
                        <Button type='submit' className="w-full">Lưu thay đổi</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
