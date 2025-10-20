// src/hooks/quiz-hooks.ts

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ApiResp } from "@/lib/type";

// ==== Updated Types to match your actual structure ====
export interface QuizOption {
    id?: number;
    optionText: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id?: number; // Optional for new questions
    questionText: string;
    questionType?: string;
    options: QuizOption[];
    correctIndex?: number; // Keep for backward compatibility
}

export interface QuizDetail {
    id: number;
    title: string;
    classId?: number;
    timeLimit: number;
    description?: string;
    questions: QuizQuestion[];
    subject?: string;
    className?: string;
}

// ==== Existing hooks (unchanged) ====
export function useQuizzesQuery() {
    return useQuery({
        queryKey: ["quizzes"],
        queryFn: async () => {
            const res = await apiClient.get<ApiResp<any[]>>("api/quizzes");
            return res.data;
        },
    });
}


export function useQuiz(id: string | number | undefined) {
    return useQuery({
        queryKey: ["quiz", String(id)],
        enabled: !!id,
        staleTime: 60_000,
        queryFn: async () => {
            if (!id) throw new Error("ID bài quiz không hợp lệ");
            const res = await apiClient.get<ApiResp<QuizDetail>>(`api/quizzes/${id}`);
            if (!res.success || !res.data) throw new Error(res.message || "Không có dữ liệu bài quiz");
            return res.data;
        },
        retry: (failureCount, error: any) => {
            const isNetworkError = !error?.response;
            return isNetworkError && failureCount < 1;
        },
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
    });
}

export function extractApiError(error: any): string {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.message) {
        return error.message;
    }
    return "Đã xảy ra lỗi không xác định";
}

export function useQuizById(id: number, role: "student" | "teacher" = "student") {
    return useQuery<QuizDetail>({
        queryKey: ["quiz", id, role],
        queryFn: async () => {
            const res = await apiClient.get<ApiResp<QuizDetail>>(`api/quizzes/${id}?role=${role}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useQuizQuestionsPage(
    quizId: number,
    page: number = 1,
    size: number = 10
) {
    return useQuery({
        queryKey: ["quiz", quizId, "questions", page, size],
        queryFn: async () => {
            const res = await apiClient.get<ApiResp<any>>(
                `api/quizzes/${quizId}/questions?page=${page}&size=${size}`
            );
            if (!res.success) {
                const error: any = new Error(res.message || "Lỗi khi tải câu hỏi quiz");
                error.response = { data: res };
                throw error;
            }
            return res.data;
        },
        placeholderData: keepPreviousData,
        enabled: !!quizId,
    });
}



// ==== Mutations ====
export function useApproveQuiz() {
  return useMutation({
    mutationFn: async (quizData: any) => {
      const res = await apiClient.post<ApiResp<any>>("api/quizzes", quizData);

      if (!res.data.success) {
        const error: any = new Error(res.data.message || "Lỗi khi duyệt quiz");
        error.response = { data: res.data };
        throw error;
      }

      return res.data; // đây mới là payload chuẩn
    },
  });
}


export function useCreateQuiz() {
    return useMutation({
        mutationFn: async (quizData: any) => {
            const res = await apiClient.post<ApiResp<any>>("api/quizzes", quizData);
            return res.data;
        },
    });
}

// ==== Updated Types for Quiz Updates ====
export interface QuizBaseDTO {
    title: string;
    classId?: number;
    timeLimit: number;
    description?: string;
}

export interface QuizContentUpdateDTO {
    questions: QuizQuestion[];
    replaceAll?: boolean;
}

// ==== Enhanced mutation hooks ====
export function useUpdateQuizMeta(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: QuizBaseDTO) => {
            const res = await apiClient.patch<ApiResp<QuizDetail>>(`api/quizzes/${id}`, payload);
            return res.data;
        },
        onSuccess: (data) => {
            // Update cache optimistically
            qc.setQueryData(["quiz", String(id)], data);
            qc.invalidateQueries({ queryKey: ["quizzes"] });
        },
    });
}

export function useReplaceQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: QuizContentUpdateDTO) => {
            const res = await apiClient.put<ApiResp<QuizDetail>>(`api/quizzes/${id}/content`, {
                ...payload,
                replaceAll: true
            });
            return res.data;
        },
        onSuccess: (data) => {
            qc.setQueryData(["quiz", String(id)], data);
        },
    });
}

export function useUpsertQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: QuizContentUpdateDTO) => {
            console.log('Sending upsert payload:', payload);
            const res = await apiClient.patch<ApiResp<QuizDetail>>(`api/quizzes/${id}/content`, {
                ...payload,
                replaceAll: false
            });
            return res.data;
        },
        onSuccess: (data) => {
            qc.setQueryData(["quiz", String(id)], data);
        },
    });
}

export function useDeleteQuizQuestion(quizId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (questionId: number) => {
            const res = await apiClient.delete<void>(`api/quizzes/${quizId}/questions/${questionId}`);
            return res.data;
        },
        onSuccess: () => {
            // Invalidate to refetch fresh data
            qc.invalidateQueries({ queryKey: ["quiz", String(quizId)] });
        },
    });
}

export function useDeleteQuiz(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.delete<void>(`api/quizzes/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quizzes"] });
            qc.removeQueries({ queryKey: ["quiz", String(id)] });
        },
    });
}

// ==== New composite hook for complex update operations ====
export function useUpdateQuiz(id: number) {
    const qc = useQueryClient();
    const updateMeta = useUpdateQuizMeta(id);
    const upsertContent = useUpsertQuizContent(id);
    const deleteQuestion = useDeleteQuizQuestion(id);

    return useMutation({
        mutationFn: async ({
            metaChanges,
            questionsToUpsert,
            questionIdsToDelete
        }: {
            metaChanges?: QuizBaseDTO;
            questionsToUpsert?: QuizQuestion[];
            questionIdsToDelete?: number[];
        }) => {
            const results = [];

            // 1. Delete questions first
            if (questionIdsToDelete && questionIdsToDelete.length > 0) {
                for (const questionId of questionIdsToDelete) {
                    await deleteQuestion.mutateAsync(questionId);
                }
            }

            // 2. Update meta information
            if (metaChanges) {
                const metaResult = await updateMeta.mutateAsync(metaChanges);
                results.push(metaResult);
            }

            // 3. Upsert questions
            if (questionsToUpsert && questionsToUpsert.length > 0) {
                const contentResult = await upsertContent.mutateAsync({
                    questions: questionsToUpsert,
                    replaceAll: false
                });
                results.push(contentResult);
            }

            return results;
        },
        onSuccess: () => {
            // Final cache update
            qc.invalidateQueries({ queryKey: ["quiz", String(id)] });
        }
    });
}