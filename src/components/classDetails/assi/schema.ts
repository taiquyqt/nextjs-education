
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
export
    const assignmentSchema = yup.object().shape({
        title: yup
            .string()
            .required("Tiêu đề là bắt buộc")
            .max(255, "Tiêu đề không được vượt quá 255 ký tự"),

        description: yup
            .string()
            .nullable()
            .optional()
            .max(2000, "Mô tả không được vượt quá 2000 ký tự"),

        dueDate: yup
            .date()
            .required("Hạn nộp là bắt buộc")
            .min(new Date(), "Hạn nộp phải lớn hơn hoặc bằng hôm nay"),

        maxScore: yup
            .number()
            .required("Điểm tối đa là bắt buộc")
            .min(0, "Điểm tối đa phải lớn hơn hoặc bằng 0")
            .typeError("Điểm tối đa phải là một số"),
        classId: yup
            .number()
            .required("Lớp là bắt buộc")
            .typeError("Vui lòng chọn một lớp"),

        file: yup
            .mixed<File>() // Chấp nhận File hoặc null
            .test("fileSize", "Tệp quá lớn (tối đa 10MB)", (value) => {
                return value ? value.size <= 10 * 1024 * 1024 : true;
            })
            .test("fileType", "Định dạng tệp không hợp lệ", (value) => {
                return value
                    ? [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "image/jpeg",
                        "image/png",
                    ].includes(value.type)
                    : true;
            }),
    });
