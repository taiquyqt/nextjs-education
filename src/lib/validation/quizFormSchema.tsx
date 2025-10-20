import * as yup from "yup";

export const quizFormSchema = yup.object().shape({
  title: yup.string().required("Vui lòng nhập tiêu đề"),
  subject: yup.string().required("Vui lòng chọn môn học"),
  timeLimit: yup
    .number()
    .typeError("Thời gian phải là số")
    .positive("Thời gian phải lớn hơn 0")
    .integer("Thời gian phải là số nguyên")
    .required("Vui lòng nhập thời gian làm bài"),
  startDate: yup
    .date()
    .typeError("Ngày bắt đầu không hợp lệ")
    .required("Vui lòng chọn ngày bắt đầu"),
  endDate: yup
    .date()
    .typeError("Ngày kết thúc không hợp lệ")
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu")
    .required("Vui lòng chọn ngày kết thúc"),
  description: yup.string().required("Vui lòng nhập mô tả"),
  files: yup
    .array()
    .of(
      yup
        .mixed<File>()
        .test("is-pdf", "Chỉ chấp nhận tệp .pdf", (file) =>
          file ? file.name.endsWith(".pdf") : false
        )
    )
    .min(1, "Vui lòng tải lên ít nhất 1 tệp .pdf"),
  classId: yup.number().required(), // ẩn trong form, nhưng cần validate nếu bạn submit
  createdBy: yup.number().required(), // giống classId
});
