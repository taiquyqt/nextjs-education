import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useTeacherClasses(teacherId: number | null) {
  return useQuery({
    queryKey: ["teacher-classes", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      return apiClient<any[]>(`api/auth/classes/teachers/${teacherId}`);
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
}
