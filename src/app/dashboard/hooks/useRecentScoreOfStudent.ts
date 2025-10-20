import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface RecentScore {
    className: string,
    subjectName: string,
    score: number,
    type: string,
    title: string,
    submittedAt: string,
}

export function useRecentScoreOfStudent() {
    return useQuery<RecentScore[]>({
        queryKey: ["recent-scores"],
        queryFn: () => apiClient<RecentScore[]>(`/api/student/recent-scores`),
        staleTime: 1000 * 60 * 5,
    });
}
