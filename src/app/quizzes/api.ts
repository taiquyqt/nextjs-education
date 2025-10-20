import { apiCall } from "@/lib/api";
import { ApiResp, QuizFilters } from "@/lib/type";
import { QuizCard } from "@/types/quiz.type";

export function buildQueryString(filters: QuizFilters) {
  const qs = new URLSearchParams();
  if (filters.page) qs.set("page", String(filters.page));
  if (filters.pageSize) qs.set("pageSize", String(filters.pageSize));
  if (filters.classId) qs.set("classId", String(filters.classId));
  if (filters.status) qs.set("status", filters.status);
  if (filters.search) qs.set("search", filters.search);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function toQuizCard(quiz: any): QuizCard {


    return {
        id: quiz.id,
        title: quiz.title || "Không có tiêu đề",
        description: quiz.description || "Không có mô tả",
        className: quiz.className || "Chưa rõ lớp",
        timeLimit: quiz.timeLimit || 0,
        totalQuestions: quiz.totalQuestion || 0,
        totalStudents: quiz.totalStudents ?? 0,
        startDate: quiz.startDate ?? null,
        endDate: quiz.endDate ?? "",
        subject: quiz.subject ?? "Chưa có môn",
        studentsSubmitted: quiz.studentsSubmitted || 0,
        studentsUnSubmitted: quiz.studentsUnSubmitted || 0,
        status: "open",
        classID: quiz.classId,
        createdBy: quiz.createdBy,
    };

}
// endpoints

export async function fetchQuizzes(filters: QuizFilters = {}) {
    const qs = buildQueryString(filters);
    const data = await apiCall<any>(`/api/quizzes${qs}`);
    return data ?? [];
}
export async function fetchQuizzesByTeacher() {
    const data = await apiCall<ApiResp<any[]>>(`/api/quizzes/teacher`);

    return data.data ?? [];
}
export async function fetchQuizById(id: number) {
    return apiCall<ApiResp<any>>(`/api/quizzes/${id}`);
}


export class ApiError extends Error {
  status?: number;
  body?: unknown;
  constructor(msg: string, status?: number, body?: unknown) {
    super(msg);
    this.status = status;
    this.body = body;
  }
}

export async function handleFetchError(res: Response) {
  // Server trả JSON dạng { success:false, message, ... }
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* ignore */
  }

  const msg =
    payload?.message ||
    payload?.message?.[0] ||
    `Request failed with status ${res.status}`;

  throw new ApiError(msg, res.status, payload);
}
