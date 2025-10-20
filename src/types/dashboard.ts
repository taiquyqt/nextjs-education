// types/dashboard.ts
export interface UpcomingAssignmentDto {
  id?: number;
  title: string;
  className?: string;
  dueDate?: string;
  type?: string;
  daysLeft?: number;
}

export interface ClassProgressDTO {
  className?: string;
  completed?: number;
  total?: number;
}

export interface StudentDashboardResponse {
  enrolledClasses: number;
  totalAssignments: number;
  avgScore: number;
  completedAssignments: number;
  upcomingDeadlines: UpcomingAssignmentDto[];
  classProgress: ClassProgressDTO[];
}

export interface ActivityLogResponseDTO {
  id?: number;
  message?: string;
  type?: string;
  className?: string;
  time?: string;
}

export interface UpcomingDeadlines {
  id: number;
  title: string;
  className: string;
  dueDate: string;
  daysLeft: number;
  submittedCount: number;
  totalStudents: number;
}

export interface TeacherDashboardResponse {
  totalClasses: number;
  totalStudents: number;
  totalAssignments: number;
  pendingGrading: number;
  averageGrade: number;
  recentActivities: ActivityLogResponseDTO[];
  upcomingDeadlinesTeacher: UpcomingDeadlines[];
}
