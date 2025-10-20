"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { getClassWithSessions } from "@/services/classScheduleService";
import SessionListView from "@/components/classSchedule/SessionListView";
import WeeklyTimetableView from "@/components/classSchedule/WeeklyTimetableView";
import { getClassById } from "@/services/classService";
import { toast } from "react-toastify";

// Utility function
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

// Format date functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString("vi-VN");
};

// Get day of week from date
const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[date.getDay()];
};
const dayOfWeekMapping: { [key: string]: string } = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật",
};

const dayOfWeekShort: { [key: string]: string } = {
  SUNDAY: "CN",
  MONDAY: "T2",
  TUESDAY: "T3",
  WEDNESDAY: "T4",
  THURSDAY: "T5",
  FRIDAY: "T6",
  SATURDAY: "T7",
};

// Mock function to get sessions - replace with actual API call

interface SessionData {
  id: number;
  patternId: number;
  classId: number;
  sessionDate: string;
  startPeriod: number;
  endPeriod: number;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED";
  note?: string;
}

// Session List Component

// Weekly Timetable Component

export default function ClassSchedulePage() {
  const params = useParams();
  const id = params.id as string;

  const [classData, setClassData] = useState<any>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch class info with sessions
        const data = await getClassWithSessions(id);
        getClassById(Number(id))
          .then((data) => {
            console.log("Classes data:", data);
            setClassData(data);
          })
          .catch((err) => {
            console.error("Lỗi khi lấy lớp:", err);
            toast.error(
              err?.response?.data?.messages?.[0] ??
                "Không thể tải thông tin lớp!"
            );
          });
        setSessions(data || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(
          error?.response?.data?.messages?.[0] ||
            "Có lỗi xảy ra khi tải dữ liệu!"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-green-700">
                    Lịch học - {classData?.className || `Lớp ${id}`}
                  </CardTitle>
                  <div className="text-gray-600 mt-2">
                    <span>
                      Giáo viên: {classData?.teacher?.fullName || "N/A"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Môn học: {classData?.subject?.name || "N/A"}</span>
                    <span className="mx-2">•</span>
                    <span>Tổng số buổi: {sessions.length}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Năm học</div>
                  <div className="font-semibold">
                    {classData?.schoolYear || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {classData?.semester || "N/A"}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Danh sách buổi học</TabsTrigger>
              <TabsTrigger value="timetable">Thời khóa biểu tuần</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <SessionListView sessions={sessions} classId={id} />
            </TabsContent>

            <TabsContent value="timetable">
              <WeeklyTimetableView sessions={sessions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
