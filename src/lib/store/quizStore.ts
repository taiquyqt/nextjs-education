"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { AiQuizSettings, Question, Quiz } from "@/types/quiz.type";

type State = {
    files: FileItem[];
    settings: AiQuizSettings;
    isGenerating: boolean;
    quiz: Quiz | null;
    hasUnsavedChanges: boolean;
};

type Actions = {
    addFiles: (files: File[]) => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;

    updateSettings: (patch: Partial<AiQuizSettings>) => void;

    setGenerating: (v: boolean) => void;
    setQuiz: (quiz: Quiz) => void;

    markDirty: () => void;
    markSaved: () => void;

    updateQuestion: (qid: string, patch: Partial<Question>) => void;
    removeQuestion: (qid: string) => void;

    addOption: (qid: string) => void;
    updateOption: (
        qid: string,
        optionId: string,
        patch: { text?: string; correct?: boolean }
    ) => void;
    removeOption: (qid: string, optionId: string) => void;

    getBackendSettings: () => AiQuizSettings;
};

const defaultSettings: Settings = {
    generationMode: "GENERATE",
    language: "Tiếng Việt",
    questionType: "Multiple Choice",
    difficulty: "Medium",
    mode: "Quiz",
    task: "Generate Quiz",
    numberOfQuestions: 10,
    title: "",
};

export const useQuizStore = create<State & Actions>((set, get) => ({
    files: [],
    settings: defaultSettings,
    isGenerating: false,
    quiz: null,
    hasUnsavedChanges: false,

    addFiles: (files) =>
        set((s) => ({
            files: [
                ...s.files,
                ...files.map((file) => ({
                    id: nanoid(),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type || "unknown",
                })),
            ],
        })),
    removeFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
    clearFiles: () => set({ files: [] }),

    updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

    setGenerating: (v) => set({ isGenerating: v }),
    setQuiz: (quiz) => set({ quiz, hasUnsavedChanges: false }),

    markDirty: () => set({ hasUnsavedChanges: true }),
    markSaved: () => set({ hasUnsavedChanges: false }),

    updateQuestion: (qid, patch) =>
        set((s) => {
            if (!s.quiz) return {};
            const updated = s.quiz.questions.map((q) =>
                q.id === qid ? ({ ...q, ...patch } as Question) : q
            );
            return { quiz: { ...s.quiz, questions: updated }, hasUnsavedChanges: true };
        }),

    removeQuestion: (qid) =>
        set((s) => {
            if (!s.quiz) return {};
            const updated = s.quiz.questions.filter((q) => q.id !== qid);
            return { quiz: { ...s.quiz, questions: updated }, hasUnsavedChanges: true };
        }),

    addOption: (qid) =>
        set((s) => {
            if (!s.quiz) return {};
            const updated = s.quiz.questions.map((q) => {
                if (q.id !== qid || q.type !== "multiple_choice") return q;
                const newOption = { id: nanoid(), text: "Phương án mới", correct: false };
                return { ...q, options: [...q.options, newOption] };
            });
            return { quiz: { ...s.quiz, questions: updated }, hasUnsavedChanges: true };
        }),

    updateOption: (qid, optionId, patch) =>
        set((s) => {
            if (!s.quiz) return {};
            const updated = s.quiz.questions.map((q) => {
                if (q.id !== qid || q.type !== "multiple_choice") return q;

                let options = q.options;

                // Quan trọng: phải check === 'boolean' để nhận cả true/false
                if (typeof patch.correct === "boolean") {
                    // single-correct: chỉ optionId được phép true
                    options = q.options.map((o) => ({
                        ...o,
                        correct: o.id === optionId ? patch.correct! : false,
                    }));
                }

                if (patch.text !== undefined) {
                    options = options.map((o) =>
                        o.id === optionId ? { ...o, text: patch.text! } : o
                    );
                }

                return { ...q, options };
            });

            return { quiz: { ...s.quiz, questions: updated }, hasUnsavedChanges: true };
        }),

    removeOption: (qid, optionId) =>
        set((s) => {
            if (!s.quiz) return {};
            const updated = s.quiz.questions.map((q) => {
                if (q.id !== qid || q.type !== "multiple_choice") return q;
                return { ...q, options: q.options.filter((o) => o.id !== optionId) };
            });
            return { quiz: { ...s.quiz, questions: updated }, hasUnsavedChanges: true };
        }),

    getBackendSettings: (): AiQuizSettings => {
        const s = get().settings;

        const language = s.language === "Auto" ? null : s.language;
        const questionTypeMap: Record<string, string> = {
            "Multiple Choice": "multiple_choice",
            "True/False": "true_false",
            "Free Response": "free_response",
        };

        // difficulty UI -> BE (lower)
        const difficultyMap: Record<string, string> = {
            Easy: "easy",
            Medium: "medium",
            Hard: "hard",
        };

        const studyModeMap: Record<string, string> = {
            Quiz: "quiz",
            Flashcard: "flashcard",
            "Study Guide": "study_guide",
        };

        return {
            numQuestions: s.numQuestions,
            quizTitle: s.title || "",
            language: language || "Tiếng Việt",
            questionType: (questionTypeMap[s.questionType] ?? s.questionType) as any,
            difficulty: (difficultyMap[s.difficulty] ?? s.difficulty) as any,
            studyMode: (studyModeMap[s.mode] ?? s.mode) as any,
            userPrompt: "",
        };
    },
}));
