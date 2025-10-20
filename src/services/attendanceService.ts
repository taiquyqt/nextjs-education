import apiClient from "@/lib/axios";

interface AttendanceRecord {
    sessionId: number;
  studentId: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string;
}

interface BulkAttendanceRequestDTO {
  noteSession: string;
  records: AttendanceRecord[];
}

  interface SaveAttendanceResponse {
    success: boolean;
    message?: string;
  }

export const  attendanceService = {
  async getAttendanceBySession(sessionId: number): Promise<AttendanceRecord[]> {

      const response = await apiClient(`/attendance/${sessionId}`);
    return response.data;
  },



    async saveAttendance(sessionId: number, data: BulkAttendanceRequestDTO): Promise<SaveAttendanceResponse> {
    try {
      console.log("sessionId:", sessionId);
      console.log("payload:", data);

      await apiClient.post(`/attendance/${sessionId}`, data);
      return { success: true };
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lưu điểm danh"
      };
    }
  }
};