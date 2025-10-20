import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle } from "lucide-react"

interface AssignmentStatusBadgeProps {
  status: string
  dueDate: string
  grade?: number | null
}

export function AssignmentStatusBadge({ status, dueDate, grade }: AssignmentStatusBadgeProps) {
  const now = new Date()
  const due = new Date(dueDate)

  if (status === "graded") {
    return (
      <Badge className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Đã chấm điểm
      </Badge>
    )
  }

  if (status === "submitted") {
    return (
      <Badge className="bg-blue-500">
        <Clock className="h-3 w-3 mr-1" />
        Chờ chấm điểm
      </Badge>
    )
  }

  if (due < now) {
    return (
      <Badge variant="destructive">
        <Clock className="h-3 w-3 mr-1" />
        Quá hạn
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      <Clock className="h-3 w-3 mr-1" />
      Chưa nộp
    </Badge>
  )
}
