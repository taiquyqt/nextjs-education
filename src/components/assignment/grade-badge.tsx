import { Badge } from "@/components/ui/badge"

interface GradeBadgeProps {
  grade: number
  showLabel?: boolean
}

export function GradeBadge({ grade, showLabel = true }: GradeBadgeProps) {
  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600"
    if (grade >= 8) return "text-blue-600"
    if (grade >= 6.5) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Badge className={`${getGradeColor(grade)} bg-white border font-bold`}>
      {showLabel ? `Điểm: ${grade}/10` : `${grade}/10`}
    </Badge>
  )
}
