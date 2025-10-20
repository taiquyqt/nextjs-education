// services/dashboard.ts
import apiClient from "@/lib/axios";
import {
  TeacherDashboardResponse,
  StudentDashboardResponse,
} from "@/types/dashboard";

// Lấy dashboard cho giáo viên
export async function fetchTeacherDashboard(): Promise<TeacherDashboardResponse> {
  const res = await apiClient.get<TeacherDashboardResponse>(
    "/dashboard/teacher"
  );
  return res.data;
}

// Lấy dashboard cho sinh viên
export async function fetchStudentDashboard(): Promise<StudentDashboardResponse> {
  const res = await apiClient.get<StudentDashboardResponse>(
    "/dashboard/student"
  );
  return res.data;
}
