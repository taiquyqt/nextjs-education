import apiClient from '@/lib/axios';




export interface SessionStatusUpdateDTO {
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED" | "HOLIDAY";
}

export interface SessionLocationUpdateDTO {
  locationId: number;
}

export interface SessionCreateDTO {
  patternId?: number;
  classId: number;
  sessionDate: string;   // yyyy-MM-dd
  startPeriod: number;
  endPeriod: number;
  location: string;      // nếu backend dùng entity Location thì đổi thành locationId
  status: "SCHEDULED" | "PENDING" | "CANCELLED" | "HOLIDAY" | "COMPLETED" | "MAKEUP";
  note?: string;
}

export const sessionApi = {
  updateStatus: (id: number, dto: SessionStatusUpdateDTO) =>
    apiClient.patch(`/auth/sessions/${id}/status`, dto),

  updateLocation: (id: number, dto: SessionLocationUpdateDTO) =>
    apiClient.patch(`/auth/sessions/${id}/location`, dto),

  create: (dto: SessionCreateDTO) =>
    apiClient.post("/auth/sessions", dto),
};