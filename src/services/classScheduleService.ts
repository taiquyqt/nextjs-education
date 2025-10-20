// services/classService.ts
import apiClient from '@/lib/axios';
import { ClassItem } from '@/types/classes';

export interface ClassSchedulePatternCreateDTO {
  classId: number;
  startDate: string;
  endDate: string;
  slots: {
    dayOfWeek: string;
    startPeriod: number;
    endPeriod: number;
    locationId: number;
  }[];
}

interface SessionData {
  id: number;
  patternId: number;
  classId: number;
  sessionDate: string;
  startPeriod: number;
  endPeriod: number;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "MAKEUP" | "CANCELLED" | "HOLIDAY";
  note?: string;
}

export const createClassSchedule = async (data: ClassSchedulePatternCreateDTO) => {
  try {
    const response = await apiClient.post("/auth/class-schedule-patterns", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getAllLocations = async () => {
  try {
    const response = await apiClient.get("/auth/locations");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClassWithSessions = async (classId: string) => {
  const response = await apiClient.get(`/auth/sessions/class/${classId}`);
  return response.data; // Should include sessions array
};


export const getSessionById = async (sessionId: number): Promise<SessionData> => {
  const response = await apiClient.get(`/auth/sessions/${sessionId}`);
  return response.data;
};


export interface UpdateSessionStatusResult {
  success: boolean;
  message?: string;
}

export const updateSessionStatus = async (
  sessionId: number,
  status: string
): Promise<UpdateSessionStatusResult> => {
  try {
    await apiClient.patch(`/api/sessions/${sessionId}/status`, { status });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating session status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể cập nhật trạng thái buổi học'
    };
  }
};
