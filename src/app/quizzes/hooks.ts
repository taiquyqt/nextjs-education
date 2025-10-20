import {
    useQuery,
    keepPreviousData,
} from "@tanstack/react-query";
import {
    fetchQuizzesByTeacher,
    toQuizCard,
} from "./api";
import { QuizCard } from "@/types/quiz.type";

export function useQuizzesQuery() {
    return useQuery({
        queryKey: ["quizzes"],
        queryFn: () => {
            return fetchQuizzesByTeacher();
        },
        select: (rows): QuizCard[] => rows.map(toQuizCard),
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000, // Cache 5 phút
        retry: 3,
    });
}
