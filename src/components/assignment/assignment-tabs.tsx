import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignmentCard } from "./assignment-card"
import type { Assignment, Comment } from "@/types/assignment"

interface AssignmentTabsProps {
  assignments: Assignment[]
  comments: Comment[]
  user: any
  onAddComment: (assignmentId: number, content: string) => void
  onAddReply: (commentId: number, content: string) => void
  onSubmitAssignment?: (assignmentId: number) => void
  onViewSubmissions?: (assignmentId: number) => void
  userRole: "student" | "teacher"
}

export function AssignmentTabs({
  assignments,
  comments,
  user,
  onAddComment,
  onAddReply,
  onSubmitAssignment,
  onViewSubmissions,
  userRole,
}: AssignmentTabsProps) {
  const getTabsForRole = () => {
    if (userRole === "student") {
      return [
        { value: "pending", label: "Chưa nộp" },
        { value: "submitted", label: "Đã nộp" },
        { value: "graded", label: "Đã chấm điểm" },
      ]
    } else {
      return [
        { value: "all", label: "Tất cả" },
        { value: "pending", label: "Đang mở" },
        { value: "grading", label: "Chờ chấm" },
        { value: "completed", label: "Đã hoàn thành" },
      ]
    }
  }

  const filterAssignments = (status: string) => {
    if (userRole === "teacher") {
      switch (status) {
        case "all":
          return assignments
        case "pending":
          return assignments.filter((a) => a.status === "pending")
        case "grading":
          return assignments.filter((a) => a.status === "submitted")
        case "completed":
          return assignments.filter((a) => a.status === "graded")
        default:
          return assignments
      }
    } else {
      return assignments.filter((a) => a.status === status)
    }
  }

  const tabs = getTabsForRole()

  return (
    <Tabs defaultValue={tabs[0].value} className="space-y-4">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4">
          {filterAssignments(tab.value).map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              comments={comments}
              user={user}
              onAddComment={onAddComment}
              onAddReply={onAddReply}
              onSubmitAssignment={onSubmitAssignment}
              onViewSubmissions={onViewSubmissions}
              showSubmitButton={userRole === "student"}
              showViewSubmissionsButton={userRole === "teacher"}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
