"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { formatDateShort, dayOfWeekShort } from "@/untils/datetime";
import { cn } from "@/lib/utils";

interface SessionData {
  id: number;
  sessionDate: string;
  startPeriod: number;
  endPeriod: number;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED" | "MAKEUP";
}

export default function WeeklyTimetableView({ sessions }: { sessions: SessionData[] }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Lấy danh sách ngày trong tuần
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Sunday
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentWeek);

  const weekSessions = sessions.filter((s) => {
    const d = new Date(s.sessionDate);
    return weekDates.some((wd) => wd.toDateString() === d.toDateString());
  });

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 1);

  const getSessionForSlot = (date: Date, period: number) =>
    weekSessions.find((s) => {
      const d = new Date(s.sessionDate);
      return d.toDateString() === date.toDateString() && period >= s.startPeriod && period <= s.endPeriod;
    });

  const getSessionSpan = (s: SessionData) => s.endPeriod - s.startPeriod + 1;

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prevWeek => {
      const newWeek = new Date(prevWeek);
      newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
      return newWeek;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Calendar className="h-5 w-5" /> Thời khóa biểu tuần
          </CardTitle>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">
              {formatDateShort(weekDates[0])} - {formatDateShort(weekDates[6])}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <div
            className="grid min-w-[800px]"
            style={{
              gridTemplateColumns: "120px repeat(7, 1fr)",
              gridTemplateRows: `80px repeat(${timeSlots.length}, 60px)`,
            }}
          >
            {/* Header góc trái */}
            <div className="bg-green-100 p-2 text-center font-semibold">
              Tiết / Ngày
            </div>

            {/* Header ngày trong tuần */}
            {weekDates.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={cn(
                    "p-2 text-center font-semibold border",
                    isToday ? "bg-green-200" : "bg-green-100"
                  )}
                >
                  <div>
                    {
                      dayOfWeekShort[
                        [
                          "SUNDAY",
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                        ][d.getDay()] as keyof typeof dayOfWeekShort
                      ]
                    }
                  </div>
                  <div>
                    {d.getDate()}/{d.getMonth() + 1}
                  </div>
                </div>
              );
            })}

            {/* Ô tiết học + session */}
            {timeSlots.map((period) => {
              const cells = [];
              
              // Cột đầu tiên: số tiết
              cells.push(
                <div
                  key={`period-${period}`}
                  className="bg-gray-50 text-center border p-2"
                >
                  Tiết {period}
                </div>
              );

              // Các ngày
              weekDates.forEach((d, dayIndex) => {
                const s = getSessionForSlot(d, period);
                const isFirst = s && period === s.startPeriod;

                if (s && !isFirst) return; // Skip cells that are part of a multi-period session

                cells.push(
                  <div
                    key={`cell-${period}-${dayIndex}`}
                    className="border flex items-center justify-center"
                    style={{
                      gridRow: s && isFirst ? `${period + 1} / span ${getSessionSpan(s)}` : undefined,
                      gridColumn: dayIndex + 2, // +2 vì col[0] = tiết
                    }}
                  >
                    {s && isFirst && (
                      <div className="bg-green-600 text-white rounded p-2 w-full h-full flex flex-col justify-between">
                        <div>
                          Tiết {s.startPeriod}-{s.endPeriod}
                          <div className="text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {s.location}
                          </div>
                        </div>
                        <div className="text-xs mt-2">
                          {s.status === "COMPLETED" && (
                            <div className="bg-green-200 text-green-800 px-2 py-1 rounded">
                              Đã hoàn thành
                            </div>
                          )}
                          {s.status === "PENDING" && (
                            <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                              Chờ điểm danh
                            </div>
                          )}
                          {s.status === "SCHEDULED" && (
                            <div className="bg-blue-200 text-blue-800 px-2 py-1 rounded">
                              Đã lên lịch
                            </div>
                          )}
                          {s.status === "CANCELLED" && (
                            <div className="bg-red-200 text-red-800 px-2 py-1 rounded">
                              Đã hủy
                            </div>
                          )}
                          {s.status === "MAKEUP" && (
                            <div className="bg-orange-200 text-orange-800 px-2 py-1 rounded">
                              Buổi bù
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              });

              return cells;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}