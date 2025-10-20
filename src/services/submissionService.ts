
import apiClient from '@/lib/axios';
import { Submission } from '@/types/assignment';

/**
 * Tạo FormData để nộp bài
 */
export const createSubmissionFormData = (data: {
  assignmentId: number;
  studentId: number;
  file: File;
  description?: string;
}): FormData => {
  const formData = new FormData();
  formData.append('assignmentId', String(data.assignmentId));
  formData.append('studentId', String(data.studentId));
  formData.append('file', data.file);
  if (data.description) {
    formData.append('description', data.description);
  }
  return formData;
};

/**
 * Tạo FormData để chỉnh sửa bài nộp
 */
export const createUpdateSubmissionFormData = (data: {
  file?: File;
  description?: string;
}): FormData => {
  const formData = new FormData();
  if (data.file) {
    formData.append('file', data.file);
  }
  if (data.description) {
    formData.append('description', data.description);
  }
  return formData;
};

// ======================== API CALLS ========================

// Lấy tất cả submissions
export const getAllSubmissions = async (): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>('/submissions');
  return response.data;
};

// Nộp bài tập
export const submitAssignment = async (formData: FormData): Promise<Submission> => {
  const response = await apiClient.post<Submission>('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Chỉnh sửa bài nộp
export const updateSubmission = async (
  submissionId: number,
  formData: FormData
): Promise<Submission> => {
  const response = await apiClient.patch<Submission>(`/submissions/${submissionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Chấm điểm submission
export const gradeSubmission = async (
  submissionId: number,
  payload: { score: number; comment?: string }
): Promise<Submission> => {
  const response = await apiClient.patch<Submission>(
    `/submissions/${submissionId}/grade`,
    payload
  );
  return response.data;
};

// Chỉnh sửa điểm
export const updateGradeSubmission = async (
  submissionId: number,
  payload: { score: number; comment?: string }
): Promise<Submission> => {
  const response = await apiClient.patch<Submission>(
    `/submissions/${submissionId}/update-grade`,
    payload
  );
  return response.data;
};

// Lấy submissions theo assignment
export const getSubmissionsByAssignment = async (
  assignmentId: number
): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>(`/submissions/assignment/${assignmentId}`);
  return response.data;
};

// Lấy submissions theo học sinh
export const getSubmissionsByStudent = async (
  studentId: number
): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>(`/submissions/student/${studentId}`);
  return response.data;
};

// Lấy submission duy nhất của học sinh cho 1 assignment
export const getSubmissionByAssignmentAndStudent = async (
  assignmentId: number,
  studentId: number
): Promise<Submission> => {
  const response = await apiClient.get<Submission>(
    `/submissions/assignment/${assignmentId}/student/${studentId}`
  );
  return response.data;
};

// Lấy submissions theo lớp
export const getSubmissionsByClassId = async (classId: number): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>(`/submissions/class/${classId}`);
  return response.data;
};

// Lấy submission của học sinh cho 1 lớp
export const getSubmissionStudentByClass = async (
  classId: number,
  studentId: number
): Promise<Submission[] | Submission> => {
  const response = await apiClient.get<Submission[] | Submission>(
    `/submissions/class/${classId}/student/${studentId}`
  );
  return response.data;
};

// Tải file submission
export const downloadSubmissionFile = async (submissionId: number): Promise<Blob> => {
  const response = await apiClient.get(`/submissions/download/${submissionId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Xóa submission
export const deleteSubmission = async (submissionId: number): Promise<void> => {
  await apiClient.delete(`/submissions/${submissionId}`);
};
