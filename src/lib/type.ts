export type GenerationMode = "GENERATE" | "EXTRACT"
export type Language = "Auto" | "English" | "Tiếng Việt" | "Spanish" | "French" | "German"
export type QuestionType = "Multiple Choice" | "True/False" | "Free Response"
export type Difficulty = "Easy" | "Medium" | "Hard"
export type Visibility = "Public" | "Private" | "Unlisted"
export type Mode = "Quiz" | "Flashcard" | "Study Guide"
export type Task = "Generate Quiz" | "Review" | "Test Knowledge"
export type ParsingMode = "Fast" | "Balanced" | "Thorough"


export type QuizFilters = {
    page?: number;
    pageSize?: number;
    classId?: number;
    status?: string;
    search?: string;
};
export type ApiResp<T> = {
    success: boolean;
    message: string;
    data: T;
    timestamp: number;
};


export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}


export interface CreateAssignmentCommentRequestDto {
    assignmentId: number;
    comment: string;
    parentId?: number | null;
}
export interface AssignmentCommentDTO {
    id: number;
    assignmentId: number;
    userId: number;
    userName: string;
    avatarUrl?: string;
    comment: string;
    createdAt: string;
    updatedAt?: string;
    edited: boolean;
    deleted: boolean;
    parentId?: number;
    rootId?: number;
    depth: number;
    childrenCount: number;
}

export interface CommentEvent {
    type: "CREATED" | "UPDATED" | "DELETED";
    data: AssignmentCommentDTO;
    assignmentId: number;
    rootId?: number;
    parentId?: number;
}