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
import { Clock, Users, Play, Eye, Ban, CheckCircle2, AlertCircle, FileText } from "lucide-react";
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

// Định nghĩa 3 trạng thái Tab riêng biệt
type TabType = "available" | "submitted" | "closed";

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
        setQuizzes(payload.data || []);
      } catch (e) {
        console.error("Error fetching quizzes:", e);
      }
    };
    fetchQuizzes();
  }, []);

  // --- LOGIC PHÂN LOẠI MỚI (RÕ RÀNG HƠN) ---
  const quizzesByClassAndTab = useMemo(() => {
    // Cấu trúc dữ liệu: { "Lớp A": { available: [], submitted: [], closed: [] } }
    const grouped: { [className: string]: { [key in TabType]: StudentQuiz[] } } = {};
    const counts = { available: 0, submitted: 0, closed: 0 };
    const now = new Date();

    (quizzes || []).forEach((quiz) => {
      const className = quiz.className || "Lớp khác";

      // Khởi tạo object cho lớp nếu chưa có
      if (!grouped[className]) {
        grouped[className] = { available: [], submitted: [], closed: [] };
      }

      const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
      const isExpired = endDate ? endDate < now : false;

      // --- PHÂN LOẠI ---
      if (quiz.submitted) {
        // 1. Ưu tiên cao nhất: ĐÃ NỘP (Dù hết hạn hay chưa)
        grouped[className].submitted.push(quiz);
        counts.submitted++;
      } else if (isExpired) {
        // 2. Chưa nộp + Hết hạn => ĐÃ ĐÓNG (Bỏ thi)
        grouped[className].closed.push(quiz);
        counts.closed++;
      } else {
        // 3. Chưa nộp + Còn hạn => CÓ THỂ LÀM
        grouped[className].available.push(quiz);
        counts.available++;
      }
    });

    return { grouped, counts };
  }, [quizzes]);


  // --- FORMAT NGÀY GIỜ ---
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "Không giới hạn";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  // --- RENDER CARD (GIAO DIỆN) ---
  const renderQuizCards = (list: StudentQuiz[], currentTab: TabType) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((quiz) => {

          return (
            <CardUI key={quiz.id} className="flex flex-col h-full hover:shadow-md transition-shadow border-t-4 border-t-transparent overflow-hidden"
              // Thêm màu border-top để phân biệt nhanh
              style={{
                borderTopColor: currentTab === 'available' ? '#3b82f6' :
                  currentTab === 'submitted' ? '#22c55e' : '#9ca3af'
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <BadgeUI variant="outline" className="font-normal text-gray-500 border-gray-200">
                    {quiz.subject || "Tổng hợp"}
                  </BadgeUI>

                  {/* BADGE TRẠNG THÁI RIÊNG BIỆT */}
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

                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] leading-tight">
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
                {/* NÚT BẤM TÙY THEO TAB */}

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

          {/* --- TABS CHÍNH */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">

              {/* TAB 1: CÓ THỂ LÀM */}
              <TabsTrigger value="available" className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${counts.available > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                Có thể làm ({counts.available})
              </TabsTrigger>

              {/* TAB 2: ĐÃ NỘP */}
              <TabsTrigger value="submitted" className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${counts.submitted > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Đã làm ({counts.submitted})
              </TabsTrigger>

              {/* TAB 3: ĐÃ ĐÓNG */}
              <TabsTrigger value="closed" className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${counts.closed > 0 ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                Đã đóng ({counts.closed})
              </TabsTrigger>

            </TabsList>

            {/* CONTENT */}
            {(["available", "submitted", "closed"] as TabType[]).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-2"> 

                {/* Check rỗng */}
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

                {/* Loop qua các lớp */}
                {Object.entries(grouped).map(([className, tabsData]) => {
                  const quizzesInTab = tabsData[tab];
                  if (quizzesInTab.length === 0) return null;

                  return (
                    <div key={className} className="space-y-4">
                      {/* Header lớp học */}
                      <div className="flex items-center gap-3 mt-6 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Lớp {className}</h2>
                        <BadgeUI variant="outline" className="text-sm">
                          {quizzesInTab.length} bài kiểm tra
                        </BadgeUI>
                      </div>

                      {/* Danh sách thẻ bài thi */}
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