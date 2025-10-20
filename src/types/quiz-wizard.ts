import { Question } from "./quiz.type";

export type QuizMeta = {
    title: string;
    grade: string;
    subject: string;
    classId: number | null;
    startDate: string | null;
    endDate: string | null;
    time: string | null; // giữ string nếu bạn muốn bind Input type="number" đơn giản
    description: string;
};

export type QuizContent = {
    questions: Question[];
    source: "file" | "ai";
    files?: File[];
    fileName?: string;
    aiTraceId?: string;
};

export type QuizDraft = {
    meta: QuizMeta;
    content: QuizContent;
};