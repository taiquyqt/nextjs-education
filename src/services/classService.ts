// services/classService.ts
import apiClient from '@/lib/axios';
import { ClassItem } from '@/types/classes';

export interface ClassJoinRequest {
  requestId: number;
  classId: number;
  studentId: number;
  className: string;
  studentName: string;
  status: string;
  // Thêm các trường khác nếu cần
}
export interface JoinRequestDTO {
  requestId: number;
  classId: number;
  className: string;
  studentId: number;
  studentName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string; // nếu có reject reason
}
// Lấy danh sách lớp
export const getClasses = async (): Promise<ClassItem[]> => {
  const response = await apiClient.get<ClassItem[]>('/auth/classes');
  console.log("Dữ liệu lớp học trả về từ API:", response.data);
  return response.data;
};

export const getLatestClasses = async () => {
  const response = await apiClient.get<ClassItem[]>('/auth/classes/latest');
  console.log("Dữ liệu 10 lớp học trả về từ API:", response.data);
  return response.data;
};

export const searchClasses = async (query: string) => {
  const res = await apiClient.get(`/auth/classes/search?keyword=${query}`);
  console.log("Dữ liệu tìm lớp học trả về từ API:", res.data);
  return res.data;
};

export const getSuggestedClasses = async () => {
  const res = await apiClient.get(`/auth/classes/suggested`);
  return res.data;
};

export const getAllSubjects = async () => {
  const response = await apiClient.get("/auth/subjects"); // Hoặc URL đúng của bạn
  console.log("Dữ liệu môn học trả về từ API:", response.data);
  return response.data; // Giả sử API trả về { data: [...] }
};

export const createSubject = (payload: {
  name: string;
  description?: string;
  createdById: number;
}) => {
  console.log("Payload tạo môn học:", payload);
  return apiClient.post(`/auth/subjects`, payload);
};

// Cập nhật môn học
export const updateSubject = (id: number, payload: {
  name: string;
  description?: string;
  createdById: number;
}) => {
  console.log("Payload cập nhật môn học:", payload);
  return apiClient.put(`/auth/subjects/${id}`, payload);
};

// Xóa môn học
export const deleteSubject = (id: number) => {
  console.log("Xóa môn học ID:", id);
  return apiClient.delete(`/auth/subjects/${id}`);
};

// export const getTeacherClasses = async (teacherId: number) => {
//   const response = await apiClient.get(`/auth/classes/teacher/${teacherId}`, {
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });
// console.log("Dữ liệu lớp học trả về từ API:", response.data);
//   return response.data.data; // giả sử API trả về { data: [...] }
// };
export const getTeacherClasses = async (teacherId: number, page: number, size: number) => {
  const response = await apiClient.get(`/auth/classes/teacher/${teacherId}?page=${page}&size=${size}`, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });
  console.log("Dữ liệu lớp học trả về từ API:", response.data);
  return response.data; // giả sử API trả về { data: [...] }
};
export const createClass = (payload: {
  className: string;
  schoolYear: number;
  semester: string;
  description: string;
  teacherId: number;
  subjectId: number;
  joinMode: 'AUTO' | 'APPROVAL';
}) => {
  console.log("Payload tạo lớp:", payload);
  return apiClient.post(`/auth/classes`, payload);
};
export const updateClass = (
  classId: number,
  payload: {
    className: string;
    schoolYear: number;
    semester: string;
    description: string;
    teacherId: number;
    subjectId: number;
    joinMode: 'AUTO' | 'APPROVAL';
  }
) => {
  console.log("Payload cập nhật lớp:", payload);
  return apiClient.put(`/auth/classes/${classId}`, payload);
};


// export const createClass = async (payload: {
//   className: string;
//   schoolYear: number;
//   semester: string;
//   description: string;
//   teacherId: number;
//   subjectId: number;
// }) => {
//   const res = await fetch(`http://localhost:8080/api/auth/classes`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     const errorData = await res.json().catch(() => ({}));
//     console.error("Lỗi khi tạo lớp:", errorData);
//     throw new Error(`HTTP error! status: ${res.status}`);
//   }

//   return res.json(); // Trả về ClassResponseDTO từ backend
// };


export const deleteClass = async (id: number) => {
  const res = await apiClient.delete(`/auth/classes/${id}`);
  return res.data;
};
export const joinClass = async (classId: number, studentId: number) => {
  const response = await apiClient.post("/auth/classes/add-student", {
    classId,
    studentId,
  });
  return response.data;
};
export async function createJoinRequest(classId: number, studentId: number) {
  const response = await apiClient.post(`/classes/${classId}/join-request`, {
    studentId,
  });
  return response.data;
}
export const getStudentClassesOf = async (studentId: number) => {
  const response = await apiClient.get(`/auth/classes/students/${studentId}/classes`);
  return response.data; // <-- Lấy đúng mảng lớp học
};
export const getStudentClasses = async (studentId: number, page: number, size: number) => {
  const response = await apiClient.get(`/auth/classes/student/${studentId}/classesPaginated?page=${page}&size=${size}`);
  console.log(response.data);

  return response.data; // <-- Lấy đúng mảng lớp học
};
// export const joinClass = async (studentId: number, code: string) => {
//   const response = await apiClient.post(`/api/auth/student/${studentId}/join`, { code });
//   return response.data;
// };

export const getStudentInClasses = async (classId: number) => {
  const response = await apiClient.get(`/auth/classes/${classId}/students`);
  return response.data; // <-- Lấy đúng mảng lớp học
};



// Lấy chi tiết 1 lớp
export const getClassById = async (id: number): Promise<ClassItem> => {
  const response = await apiClient.get<ClassItem>(`/auth/classes/${id}`);
  return response.data;
};

// Tạo lớp mới


// export async function getJoinRequests(
//   classId: number,
//   status?: string
// ): Promise<ClassJoinRequest[]> {
//   const params = status ? { status } : {};

//   const res = await apiClient.get<ClassJoinRequest[]>(`/classes/${classId}/join-requests`, {
//     params,
//     // headers: { Authorization: "Bearer token..." }
//   });

//   return res.data;
// }

export async function getJoinRequests(
  teacherId: number,
  status?: string
): Promise<ClassJoinRequest[]> {
  const params = status ? { status } : {};

  const res = await apiClient.get<ClassJoinRequest[]>(`/classes/join-requests?teacherId=${teacherId}`, {
    params,
    // headers: { Authorization: "Bearer token..." }
  });

  return res.data;
}



// Approve request
export const approveJoinRequest = async (requestId: number): Promise<JoinRequestDTO> => {
  console.log("check requesrId", requestId)
  const response = await apiClient.post<JoinRequestDTO>(`/classes/join-requests/${requestId}/approve`);
  return response.data;
};

export const rejectJoinRequest = async (
  requestId: number,
  reason?: string
): Promise<JoinRequestDTO> => {
  const response = await apiClient.post<JoinRequestDTO>(
    `/classes/join-requests/${requestId}/reject`,
    reason || null
  );
  return response.data;
};


export const finalizeAttendanceScoreForClass = async (classId: number): Promise<string> => {
  const response = await apiClient.post<string>(`/auth/classes/finalize/${classId}`);
  console.log(`Finalize attendance score for class ${classId}:`, response.data);
  return response.data;
};