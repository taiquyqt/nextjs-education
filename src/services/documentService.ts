import apiClient from '@/lib/axios';
import { Document } from '@/types/document';

/**
 * Tạo FormData cho API tạo Document
 */
export const createDocumentFormData = (data: {
  classId: number;
  title: string;
  description?: string;
  createdBy: number;
  file?: File;
}): FormData => {
  const formData = new FormData();
  formData.append('classId', String(data.classId));
  formData.append('title', data.title);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('createdBy', String(data.createdBy));
  if (data.file) {
    formData.append('file', data.file);
  }
  return formData;
};

// ======================== API CALLS ========================

/**
 * Lấy tất cả tài liệu theo lớp
 */
export const getDocumentsByClassId = async (
  classId: number
): Promise<Document[]> => {
  const response = await apiClient.get<Document[]>(
    `/materials/class/${classId}`
  );
  return response.data;
};

/**
 * Tạo tài liệu mới
 */
export const createDocument = async ( formData: FormData): Promise<Document> => {
  const response = await apiClient.post<Document>('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Tải tài liệu về máy (vừa tăng lượt tải vừa trả file)
 */
export const downloadDocument = async (id: number) => {
  return apiClient.get(`/materials/download/${id}`, {
    responseType: "blob",
  });
};

/**
 * Cập nhật tài liệu
 */
export const updateDocument = async (id: number, formData: FormData): Promise<Document> => {
  const response = await apiClient.put<Document>(`/materials/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Xóa tài liệu
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await apiClient.delete(`/materials/${id}`);
};


