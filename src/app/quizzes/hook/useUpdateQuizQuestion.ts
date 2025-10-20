import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Question } from "@/types/quiz.type";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

interface UpdateQuizQuestionDTO {
    questions: Question[];
    replaceAll: boolean;
}

export function useUpdateQuizQuestion(quizId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (question: Question) => {
            const payload: UpdateQuizQuestionDTO = {
                questions: [question],
                replaceAll: false
            };

            const { data } = await apiClient.patch(
                `/quizzes/${quizId}/content`,
                payload
            );
            return data;
        },
        onSuccess: () => {
            // Invalidate the quiz cache to refetch updated data
            queryClient.invalidateQueries({ queryKey: ["quiz", quizId.toString()] });
            toast.success("Cập nhật câu hỏi thành công");
        },
        onError: (error) => {
            console.error("Lỗi khi cập nhật câu hỏi:", error);
            toast.error("Cập nhật câu hỏi thất bại");
        },
    });
}