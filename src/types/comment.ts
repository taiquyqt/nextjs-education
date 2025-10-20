export interface AssignmentCommentDTO {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        email: string;
        roles: string[];
    };
    assignmentId: number;
    repliesCount: number;
}

export interface CreateAssignmentCommentRequestDto {
    assignmentId: number;
    commentText: string;
    parentId?: number | null;
}
