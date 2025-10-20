import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Format datetime từ API (ISO string) thành chuỗi dễ đọc
 * @param dateString ISO string, vd: "2025-08-20T14:50:00"
 * @param withTime có hiển thị giờ phút hay không (default: true)
 * @returns string, vd: "20/08/2025 14:50" hoặc "20/08/2025"
 */
export function formatDateTime(dateString?: string, withTime: boolean = true): string {
  if (!dateString) return "—"; // fallback nếu null hoặc undefined

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—"; // tránh lỗi parse

  return withTime
    ? format(date, "dd/MM/yyyy HH:mm", { locale: vi })
    : format(date, "dd/MM/yyyy", { locale: vi });
}
