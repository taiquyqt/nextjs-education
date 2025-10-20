// hooks/useTeacherRanking.ts
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface StudentRanking {
    studentId: number;
    studentName: string;
    studentEmail: string;
    className: string;
    averageScore: number;
    rank: number;
}
export interface Assignment {
    name: string;
    grade: number;
    maxGrade: number;
    type: "assignment" | "quiz";
    date: string; // ISO string format
}

export interface StudentResult {
    id: number;
    subject: string;
    className: string;
    assignments: Assignment[];
    average: number;
    trend: "up" | "down" | "stable";
}


export function useTeacherRanking(teacherId: number) {
    return useQuery<StudentRanking[]>({
        queryKey: ["teacher-ranking", teacherId],
        queryFn: () =>
            apiClient<StudentRanking[]>(`api/stats/teacher/38/ranking`),
        staleTime: 1000 * 60 * 2,
    });
}
export function useStudentResult() {
    return useQuery<StudentResult[]>({
        queryKey: ["student-grades"],
        queryFn: () =>
            apiClient<StudentResult[]>(`/api/student/grades`),
        staleTime: 1000 * 60 * 2,
    });
}
