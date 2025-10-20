"use client"

import { Badge } from "@/components/ui/badge"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Upload, FileText } from "lucide-react"
import { AssignmentStatusBadge } from "./assignment-status-badge"
import { GradeBadge } from "./grade-badge"
import { CommentSection } from "./comment-section"
import type { Assignment, Comment } from "@/types/assignment"

interface AssignmentCardProps {
  assignment: Assignment
  comments: Comment[]
  user: any
  onAddComment: (assignmentId: number, content: string) => void
  onAddReply: (commentId: number, content: string) => void
  onSubmitAssignment?: (assignmentId: number) => void
  onViewSubmissions?: (assignmentId: number) => void
  showSubmitButton?: boolean
  showViewSubmissionsButton?: boolean
}

export function AssignmentCard({
  assignment,
  comments,
  user,
  onAddComment,
  onAddReply,
  onSubmitAssignment,
  onViewSubmissions,
  showSubmitButton = false,
  showViewSubmissionsButton = false,
}: AssignmentCardProps) {
  const assignmentComments = comments.filter((comment) => comment.assignmentId === assignment.id)

  const getBorderColor = () => {
    switch (assignment.status) {
      case "pending":
        return "border-l-orange-500"
      case "submitted":
        return "border-l-blue-500"
      case "graded":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <Card className={`border-l-4 ${getBorderColor()}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <CardDescription className="mt-1">
              {assignment.className} •{" "}
              {assignment.status === "graded"
                ? `Chấm lúc: ${assignment.gradedAt}`
                : assignment.status === "submitted"
                  ? `Nộp lúc: ${assignment.submittedAt}`
                  : `Hạn nộp: ${assignment.dueDate}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <AssignmentStatusBadge status={assignment.status} dueDate={assignment.dueDate} grade={assignment.grade} />
            {assignment.grade && <GradeBadge grade={assignment.grade} />}
            {showViewSubmissionsButton && assignment.submissions !== undefined && assignment.totalStudents && (
              <Badge variant="outline">
                {assignment.submissions}/{assignment.totalStudents} nộp bài
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{assignment.description}</p>

        {/* Feedback Section for Graded Assignments */}
        {assignment.status === "graded" && assignment.feedback && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-800">Kết quả chấm điểm</h4>
              {assignment.grade && (
                <span
                  className={`text-2xl font-bold ${
                    assignment.grade >= 9
                      ? "text-green-600"
                      : assignment.grade >= 8
                        ? "text-blue-600"
                        : assignment.grade >= 6.5
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {assignment.grade}/10
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Nhận xét:</p>
              <p className="text-sm text-green-700">{assignment.feedback}</p>
            </div>
          </div>
        )}

        {/* Feedback Section for Submitted Assignments */}
        {assignment.status === "submitted" && assignment.feedback && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm font-medium text-blue-800 mb-1">Nhận xét từ giáo viên:</p>
            <p className="text-sm text-blue-700">{assignment.feedback}</p>
            <p className="text-xs text-blue-600 mt-2">Chấm lúc: {assignment.gradedAt}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          {showSubmitButton && assignment.status === "pending" && (
            <Button size="sm" onClick={() => onSubmitAssignment?.(assignment.id)}>
              <Upload className="h-4 w-4 mr-1" />
              Nộp bài
            </Button>
          )}

          {showViewSubmissionsButton && (
            <Button size="sm" variant="outline" onClick={() => onViewSubmissions?.(assignment.id)}>
              <FileText className="h-4 w-4 mr-1" />
              Xem bài nộp ({assignment.submissions || 0})
            </Button>
          )}

          {(assignment.status === "submitted" || assignment.status === "graded") && (
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Xem bài đã nộp
            </Button>
          )}

          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4 mr-1" />
            {showViewSubmissionsButton ? "Bình luận" : "Hỏi bài"} ({assignmentComments.length})
          </Button>
        </div>

        <CommentSection
          assignment={assignment}
          comments={comments}
          user={user}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
        />
      </CardContent>
    </Card>
  )
}
