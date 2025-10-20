// utils/datetime.ts
export const formatDateShort = (date: Date) =>
  date.toLocaleDateString("vi-VN");

export const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  const days = [
    "SUNDAY","MONDAY","TUESDAY","WEDNESDAY",
    "THURSDAY","FRIDAY","SATURDAY"
  ];
  return days[date.getDay()];
};

export const dayOfWeekMapping: Record<string, string> = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật",
};

export const dayOfWeekShort: Record<string, string> = {
  MONDAY: "T2",
  TUESDAY: "T3",
  WEDNESDAY: "T4",
  THURSDAY: "T5",
  FRIDAY: "T6",
  SATURDAY: "T7",
  SUNDAY: "CN",
};
