import { QuizQuestion } from "@/app/quizzes/hook/quiz-hooks";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizChanges {
    meta?: {
        title?: string;
        classId?: number;
        timeLimit?: string;
        description?: string;
    };
    questions: Map<number, QuizQuestion>; // key là id của question, value là data đã thay đổi
}

interface QuizChangesStore {
    quizId?: number;
    changes: QuizChanges;
    setMetaChanges: (meta: Partial<QuizChanges['meta']>) => void;
    setQuestionChanges: (questionId: number, question: QuizQuestion) => void;
    hasChanges: () => boolean;
    getChangedQuestions: () => QuizQuestion[];
    reset: () => void;
}

const defaultChanges: QuizChanges = {
    meta: undefined,
    questions: new Map()
};

export const useQuizChangesStorage = create<QuizChangesStore>()(
    persist(
        (set, get) => ({
            quizId: undefined,
            changes: defaultChanges,
            setMetaChanges: (meta) =>
                set((state) => ({
                    changes: {
                        ...state.changes,
                        meta: { ...state.changes.meta, ...meta }
                    }
                })),
            setQuestionChanges: (questionId, question) =>
                set((state) => {
                    const newQuestions = new Map(state.changes.questions);
                    newQuestions.set(questionId, question);
                    return {
                        changes: {
                            ...state.changes,
                            questions: newQuestions
                        }
                    };
                }),
            hasChanges: () => {
                const state = get();
                return !!(
                    state.changes.meta ||
                    state.changes.questions.size > 0
                );
            },
            getChangedQuestions: () => {
                const state = get();
                return Array.from(state.changes.questions.values());
            },
            reset: () => set({ changes: defaultChanges }),
        }),
        {
            name: "quiz-changes-storage",
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const data = JSON.parse(str);
                    // Convert questions array back to Map
                    if (data.state.changes.questions) {
                        const questionsMap = new Map();
                        Object.entries(data.state.changes.questions).forEach(
                            ([key, value]) => questionsMap.set(Number(key), value)
                        );
                        data.state.changes.questions = questionsMap;
                    }
                    return data;
                },
                setItem: (name, value) => {
                    const data = { ...value };
                    // Convert Map to object for serialization
                    if (data.state.changes.questions instanceof Map) {
                        data.state.changes.questions = Object.fromEntries(
                            data.state.changes.questions
                        );
                    }
                    localStorage.setItem(name, JSON.stringify(data));
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
        }
    )
);
