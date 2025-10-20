import { QuestionType } from './setting.type';
export type Quiz = {
    id: number;
    title: string;
    description?: string;
    totalQuestions: number;
    classId?: number;
    createdAt: string;
};

export type Question = {
    questionText: string;
    questionType: string
    options: Option[];
    correctOptions: string | null;
    score: null;
    explanation?: string | null;
    correctAnswerTexts: null;
    correctAnswerRegex: null;
    caseSensitive: boolean;
    trimWhitespace: boolean;
};
export type Option = {
    optionLabel: string;
    optionText: string;
};
export type QuizzFormData = {
    title: string;
    startDate: string;
    endDate: string;
    classId?: number;
    createdBy?: number;
    timeLimit: string;
    description: string;
    fileName?: string;
    questions: Question[];
};
export type QuizzFormDatas = {
    title: string;
    startDate: string;
    endDate: string;
    classId?: number;
    timeLimit: string;
    description: string;
    questions: Question[];
};
export interface QuizCard {
    id: number;
    title: string;
    description: string;
    className: string;
    timeLimit: number;
    totalQuestions: number;
    totalStudents: number;
    studentsSubmitted: number;
    studentsUnSubmitted: number;
    endDate: string;
    startDate: string;
    subject: string;
    classID: number;
    createdBy: number;
    status: string;
}
export interface AiQuizSettings {
    numQuestions?: number;
    quizTitle?: string;
    language?: string;
    questionType?: string;
    difficulty?: string;
    studyMode?: string;
    userPrompt?: string;
}


export interface BackendQuizResponse {
    quizTitle: string;
    questions: Array<{
        QuestionType: string;
        questionText: string;
        options: Option[];
        correctIndex: number;
        explanation?: string;
        topic?: string;
        difficulty?: 'easy' | 'medium' | 'hard';
    }>;
}

