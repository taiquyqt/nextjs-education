// src/hooks/quiz-hooks.ts

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ApiResp } from "@/lib/type";

// ==========================================
// 1. TYPES DEFINITION
// ==========================================
export interface QuizOption {
    id?: number;
    optionText: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id?: number;
    questionText: string;
    questionType?: string;
    options: QuizOption[];
    correctIndex?: number;
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

// ==========================================
// 2. HELPER: SMART EXTRACT (Fix lỗi hiển thị)
// Tự động tìm data dù API trả về vỏ (ApiResp) hay ruột (Data)
// ==========================================
function smartExtract<T>(res: any): T {
    // Lấy body từ Axios Response (nếu có)
    const body = res?.data ? res.data : res;

    // Case 1: Body chuẩn { success: true, data: ... }
    if (body && body.success === true && body.data) {
        return body.data as T;
    }

    // Case 2: Body chính là data luôn (Array hoặc Object có id/title)
    if (body && (Array.isArray(body) || typeof body === 'object')) {
        return body as T;
    }

    // Fallback
    return body as T;
}

// ==========================================
// 3. HELPER: DATE FIXER (Fix lỗi 500 Backend)
// Tự động format ngày tháng sang ISO 8601 (có Z)
// ==========================================
const formatPayloadDate = (data: any) => {
    if (!data || typeof data !== 'object') return data;
    
    // Clone object để an toàn
    const payload = JSON.parse(JSON.stringify(data)); 
    const dateFields = ["startDate", "endDate"];

    dateFields.forEach((field) => {
        const val = payload[field];
        if (val && typeof val === "string") {
            // Nếu chuỗi có dạng "2025-12-31T12:00" (có :) nhưng thiếu Z
            if (val.includes(":") && !val.endsWith("Z")) {
                try {
                    // Convert sang ISO: "2025-12-31T05:00:00.000Z"
                    const isoDate = new Date(val).toISOString();
                    payload[field] = isoDate;
                    console.log(`🚀 [Auto-Fix Date] ${field}: ${val} -> ${isoDate}`);
                } catch (e) {
                    console.error("❌ Lỗi format ngày:", field, val);
                    // Fallback: Thêm thủ công nếu Date() thất bại
                    payload[field] = `${val}:00Z`;
                }
            }
        }
    });
    
    return payload;
};

// ==========================================
// 4. HOOKS (QUERIES)
// ==========================================

export function useQuizzesQuery() {
    return useQuery({
        queryKey: ["quizzes"],
        queryFn: async () => {
            const res = await apiClient.get("api/quizzes");
            return smartExtract<any[]>(res);
        },
    });
}

export function useQuiz(id: string | number | undefined) {
    return useQuery<QuizDetail>({
        queryKey: ["quiz", String(id)],
        enabled: !!id,
        staleTime: 0, // Tắt cache để luôn lấy dữ liệu mới nhất khi sửa lỗi
        queryFn: async () => {
            if (!id) throw new Error("ID bài quiz không hợp lệ");
            const res = await apiClient.get(`api/quizzes/${id}`);
            return smartExtract<QuizDetail>(res);
        },
        retry: 0,
        refetchOnWindowFocus: false,
    });
}

export function useQuizById(id: number, role: "student" | "teacher" = "student") {
    return useQuery<QuizDetail>({
        queryKey: ["quiz", id, role],
        queryFn: async () => {
            const res = await apiClient.get(`api/quizzes/${id}?role=${role}`);
            return smartExtract<QuizDetail>(res);
        },
        enabled: !!id,
    });
}

export function useQuizQuestionsPage(quizId: number, page: number = 1, size: number = 10) {
    return useQuery({
        queryKey: ["quiz", quizId, "questions", page, size],
        queryFn: async () => {
            const res = await apiClient.get(`api/quizzes/${quizId}/questions?page=${page}&size=${size}`);
            return smartExtract<any>(res);
        },
        enabled: !!quizId,
        placeholderData: keepPreviousData,
    });
}

// ==========================================
// 5. MUTATIONS (CREATE / UPDATE / DELETE)
// ==========================================

export function useApproveQuiz() {
    return useMutation({
        mutationFn: async (quizData: any) => {
            // FIX LỖI 500: Format date trước khi gửi
            const cleanData = formatPayloadDate(quizData);
            
            const res = await apiClient.post("api/quizzes", cleanData);
            return smartExtract<any>(res);
        },
    });
}

export function useCreateQuiz() {
    return useMutation({
        mutationFn: async (quizData: any) => {
            // FIX LỖI 500: Format date trước khi gửi
            const cleanData = formatPayloadDate(quizData);

            const res = await apiClient.post("api/quizzes", cleanData);
            return smartExtract<any>(res);
        },
    });
}

export function useUpdateQuizMeta(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: QuizBaseDTO) => {
            // FIX LỖI 500: Format date cho cả lúc update
            const cleanData = formatPayloadDate(payload);

            const res = await apiClient.patch(`api/quizzes/${id}`, cleanData);
            return smartExtract<QuizDetail>(res);
        },
        onSuccess: (data) => {
            qc.setQueryData(["quiz", String(id)], data);
            qc.invalidateQueries({ queryKey: ["quizzes"] });
        },
    });
}

export function useReplaceQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: QuizContentUpdateDTO) => {
            const res = await apiClient.put(`api/quizzes/${id}/content`, {
                ...payload,
                replaceAll: true
            });
            return smartExtract<QuizDetail>(res);
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
            const res = await apiClient.patch(`api/quizzes/${id}/content`, {
                ...payload,
                replaceAll: false
            });
            return smartExtract<QuizDetail>(res);
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
            const res = await apiClient.delete(`api/quizzes/${quizId}/questions/${questionId}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quiz", String(quizId)] });
        },
    });
}

export function useDeleteQuiz(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.delete(`api/quizzes/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quizzes"] });
            qc.removeQueries({ queryKey: ["quiz", String(id)] });
        },
    });
}

// ==== Composite Mutation ====
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

            // 1. Delete questions
            if (questionIdsToDelete && questionIdsToDelete.length > 0) {
                for (const questionId of questionIdsToDelete) {
                    await deleteQuestion.mutateAsync(questionId);
                }
            }

            // 2. Update meta (Đã có logic fix date bên trong hook useUpdateQuizMeta)
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
            qc.invalidateQueries({ queryKey: ["quiz", String(id)] });
        }
    });
}
export function extractApiError(error: any): string {
    // 1. Ưu tiên lấy message lỗi chi tiết từ Backend trả về
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.response?.data?.error) {
        return error.response.data.error;
    }
    
    // 2. Nếu có mảng messages (Validation)
    if (Array.isArray(error?.response?.data?.messages)) {
        return error.response.data.messages.join(", ");
    }

    // 3. Lấy message mặc định của Axios (VD: Network Error)
    if (error?.message) {
        return error.message;
    }

    return "Đã xảy ra lỗi không xác định (Unknown Error)";
}