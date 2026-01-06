"use client";

import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/navigation";

import {
  Card as CardUI,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button as ButtonUI } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Eye, Ban, CheckCircle2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

type StudentQuiz = {
  id: number;
  title: string;
  description?: string | null;
  className?: string | null;
  timeLimit?: number | null;
  totalQuestion?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  subject?: string | null;
  submitted?: boolean;
  score?: number | null;
};

// Keep tab types as is
type TabType = "available" | "submitted" | "closed";

// --- HELPER 1: ADD 7 HOURS TO FIX BACKEND OFFSET ---
const addMissingHours = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        // Add 7 hours (7 * 60 * 60 * 1000 ms)
        date.setTime(date.getTime() + (7 * 60 * 60 * 1000));
        return date.toISOString();
    } catch (e) {
        return dateStr;
    }
};

// --- HELPER 2: PARSE UTC (FOR DISPLAY) ---
const parseUtcDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  let safeStr = dateStr;
  if (safeStr.includes("T") && !safeStr.endsWith("Z") && !safeStr.includes("+")) {
      safeStr += "Z";
  }
  const date = new Date(safeStr);
  return isNaN(date.getTime()) ? null : date;
};

export default function StudentQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:8080/api/quizzes/student`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const payload = await res.json();
        
        // --- FIX DATA HERE ---
        const rawData = payload.data || [];
        
        // Map through each quiz to fix the time (Add 7 hours)
        const fixedData = rawData.map((quiz: StudentQuiz) => ({
            ...quiz,
            startDate: addMissingHours(quiz.startDate),
            endDate: addMissingHours(quiz.endDate)
        }));

        setQuizzes(fixedData);
      } catch (e) {
        console.error("Error fetching quizzes:", e);
      }
    };
    fetchQuizzes();
  }, []);

  // --- LOGIC (UNCHANGED) ---
  const quizzesByClassAndTab = useMemo(() => {
    const grouped: { [className: string]: { [key in TabType]: StudentQuiz[] } } = {};
    const counts = { available: 0, submitted: 0, closed: 0 };
    const now = new Date();

    (quizzes || []).forEach((quiz) => {
      const className = quiz.className || "Lớp khác";

      if (!grouped[className]) {
        grouped[className] = { available: [], submitted: [], closed: [] };
      }

      // Parse dates (already added +7h above)
      const startDate = parseUtcDate(quiz.startDate);
      const endDate = parseUtcDate(quiz.endDate);

      // --- CLASSIFICATION ---
      if (quiz.submitted) {
        grouped[className].submitted.push(quiz);
        counts.submitted++;
        return; 
      }

      if (!startDate || !endDate) {
         grouped[className].closed.push(quiz);
         counts.closed++;
         return;
      }
      
      // Check expiration using the fixed dates
      const isExpired = endDate < now;

      if (isExpired) {
        grouped[className].closed.push(quiz);
        counts.closed++;
      } else {
        grouped[className].available.push(quiz);
        counts.available++;
      }
    });

    return { grouped, counts };
  }, [quizzes]);


  // --- FORMAT DISPLAY ---
  const formatDateTime = (dateString?: string | null) => {
    const date = parseUtcDate(dateString);
    if (!date) return "Không giới hạn";
    return date.toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  // --- RENDER CARD (UNCHANGED) ---
  const renderQuizCards = (list: StudentQuiz[], currentTab: TabType) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((quiz) => {
          return (
            <CardUI key={quiz.id} className="flex flex-col h-full hover:shadow-md transition-shadow border-t-4 border-t-transparent overflow-hidden"
              style={{
                borderTopColor: 
                  currentTab === 'available' ? '#3b82f6' : 
                  currentTab === 'submitted' ? '#22c55e' : '#9ca3af' 
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <BadgeUI variant="outline" className="font-normal text-gray-500 border-gray-200">
                    {quiz.subject || "Tổng hợp"}
                  </BadgeUI>

                  {/* BADGE */}
                  {currentTab === 'available' && (
                    <BadgeUI className="bg-blue-100 text-blue-700">
                      <Clock className="w-3 h-3 mr-1" /> Đang mở
                    </BadgeUI>
                  )}
                  {currentTab === 'submitted' && (
                    <BadgeUI className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Đã nộp
                    </BadgeUI>
                  )}
                  {currentTab === 'closed' && (
                    <BadgeUI variant="destructive" className="bg-gray-100 text-gray-500">
                      <Ban className="w-3 h-3 mr-1" /> Đã đóng
                    </BadgeUI>
                  )}
                </div>

                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 min-h-14 leading-tight">
                  {quiz.title}
                </CardTitle>
                <CardDescription>Lớp {quiz.className}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 text-sm text-gray-600 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{quiz.timeLimit} phút</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{quiz.totalQuestion || 0} câu</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                   {currentTab === 'available' ? `Hết hạn: ${formatDateTime(quiz.endDate)}` :
                    currentTab === 'submitted' ? `Đã nộp bài` :
                      `Đã hết hạn vào: ${formatDateTime(quiz.endDate)}`}
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                {currentTab === 'available' && (
                  <ButtonUI className="w-full bg-blue-600 " onClick={() => router.push(`student/${quiz.id}`)}>
                    <Play className="h-4 w-4 mr-2" /> Bắt đầu làm bài
                  </ButtonUI>
                )}

                {currentTab === 'submitted' && (
                  <div className="w-full flex gap-2">
                    <ButtonUI variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                      <Eye className="h-4 w-4 mr-2" /> Xem kết quả
                    </ButtonUI>
                    {quiz.score !== null && (
                      <div className="flex items-center justify-center font-bold text-green-700 bg-green-100 px-3 rounded-md border border-green-200">
                        {quiz.score}đ
                      </div>
                    )}
                  </div>
                )}

                {currentTab === 'closed' && (
                  <ButtonUI variant="ghost" disabled className="w-full bg-gray-100 text-gray-400 cursor-not-allowed">
                    <Ban className="h-4 w-4 mr-2" /> Không thể làm bài
                  </ButtonUI>
                )}
              </CardFooter>
            </CardUI>
          );
        })}
      </div>
    );
  };

  if (!user) return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;
  const { grouped, counts } = quizzesByClassAndTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bài kiểm tra của tôi</h1>
              <p className="text-gray-600 mt-1">Danh sách bài tập và bài thi được phân công</p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">

              <TabsTrigger value="available" className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${counts.available > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                Có thể làm ({counts.available})
              </TabsTrigger>

              <TabsTrigger value="submitted" className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${counts.submitted > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Đã làm ({counts.submitted})
              </TabsTrigger>

              <TabsTrigger value="closed" className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${counts.closed > 0 ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                Đã đóng ({counts.closed})
              </TabsTrigger>

            </TabsList>

            {(["available", "submitted", "closed"] as TabType[]).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-2"> 

                {Object.keys(grouped).every(cls => grouped[cls][tab].length === 0) && (
                  <CardUI>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500 text-lg">
                        Không có bài kiểm tra nào ở mục này
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Vui lòng kiểm tra lại thời gian hoặc thông báo từ giáo viên
                      </p>
                    </CardContent>
                  </CardUI>
                )}

                {Object.entries(grouped).map(([className, tabsData]) => {
                  const quizzesInTab = tabsData[tab];
                  if (quizzesInTab.length === 0) return null;

                  return (
                    <div key={className} className="space-y-4">
                      <div className="flex items-center gap-3 mt-6 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Lớp {className}</h2>
                        <BadgeUI variant="outline" className="text-sm">
                          {quizzesInTab.length} bài kiểm tra
                        </BadgeUI>
                      </div>
                      {renderQuizCards(quizzesInTab, tab)}
                    </div>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}